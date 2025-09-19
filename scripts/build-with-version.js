import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Get git hash (short version)
function getGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('Could not get git hash, using "dev"');
    return 'dev';
  }
}

// Get build number from environment variable or use timestamp
function getBuildNumber() {
  // You can set BUILD_NUMBER in CI/CD environment
  if (process.env.BUILD_NUMBER) {
    return process.env.BUILD_NUMBER;
  }
  // Use date-based build number as fallback (YYYYMMDD.HHMM)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}.${hours}${minutes}`;
}

// Read package.json
const packageJsonPath = path.join(projectRoot, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Get version strategy from command line arguments
const strategy = process.argv[2] || 'hash'; // 'hash', 'build', or 'both'

let versionSuffix = '';
switch (strategy) {
  case 'hash':
    versionSuffix = `-${getGitHash()}`;
    break;
  case 'build':
    versionSuffix = `-${getBuildNumber()}`;
    break;
  case 'both':
    versionSuffix = `-${getBuildNumber()}-${getGitHash()}`;
    break;
  case 'none':
    versionSuffix = '';
    break;
  default:
    console.log('Invalid strategy. Use: hash, build, both, or none');
    process.exit(1);
}

// Create full version string for file naming ONLY
const fileVersion = packageJson.version + versionSuffix;

// Update electron-builder config
const builderConfigPath = path.join(projectRoot, 'electron-builder.json');
const builderConfig = JSON.parse(fs.readFileSync(builderConfigPath, 'utf-8'));

// DO NOT change the app version - keep it clean
// Only use the version suffix for the installer file name
builderConfig.extraMetadata = {
  ...builderConfig.extraMetadata,
  version: packageJson.version  // Use clean version for the app
};

// Customize artifact names to include git hash or build number
builderConfig.artifactName = `\${productName} Setup ${fileVersion}.\${ext}`;

// Write updated config to temporary file
const tempConfigPath = path.join(projectRoot, 'electron-builder-temp.json');
fs.writeFileSync(tempConfigPath, JSON.stringify(builderConfig, null, 2));

console.log(`Building installer with file name version: ${fileVersion}`);
console.log(`App will display version: ${packageJson.version}`);

// Get platform from command line or use current platform
const platform = process.argv[3] || process.platform;
const platformFlag = platform === 'darwin' ? '--mac' : platform === 'linux' ? '--linux' : '--win';

try {
  // Run vite build first
  console.log('Building with Vite...');
  execSync('npm run build', { stdio: 'inherit', cwd: projectRoot });

  // Run electron-builder with custom config (disable auto-publish)
  console.log(`Building installer for ${platform}...`);
  execSync(`npx electron-builder ${platformFlag} --config ${tempConfigPath} --publish never`, {
    stdio: 'inherit',
    cwd: projectRoot
  });

  console.log(`✅ Build completed successfully!`);
  console.log(`   Installer file: ${fileVersion}`);
  console.log(`   App version: ${packageJson.version}`);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
} finally {
  // Clean up temporary config file
  if (fs.existsSync(tempConfigPath)) {
    fs.unlinkSync(tempConfigPath);
  }
}