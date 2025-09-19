const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    // Folder name for packaged app (e.g., Telechips-sc-camera-win32-x64)
    name: 'Telechips-sc-camera',
    asar: true,
    // Use Telechips app icon (provide assets/telechips.ico|icns|png)
    icon: './assets/telechips',
    productName: 'Telechips SOC Configuration Tool',
    executableName: 'Telechips-sc-camera',
    // Disable electron default updater and protocols to minimize AV prompts
    protocols: [],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Telechips-sc-camera',
        setupExe: 'Telechips-sc-camera Setup.exe',
        // 코드서명은 환경변수 설정 시에만 적용 (없으면 무서명 빌드)
        ...(process.env.WIN_CERT_FILE && process.env.WIN_CERT_PASSWORD
          ? {
              certificateFile: process.env.WIN_CERT_FILE,
              certificatePassword: process.env.WIN_CERT_PASSWORD,
              signWithParams: '/fd sha256 /tr http://timestamp.digicert.com /td sha256'
            }
          : {}),
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
