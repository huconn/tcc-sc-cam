const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './assets/icon',
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
        // 코드서명: 환경변수를 통해 PFX 경로/비밀번호를 주입하세요
        //   $env:WIN_CERT_FILE="C:\\path\\to\\code-signing.pfx"
        //   $env:WIN_CERT_PASSWORD="your_password"
        certificateFile: process.env.WIN_CERT_FILE,
        certificatePassword: process.env.WIN_CERT_PASSWORD,
        // SmartScreen/AV 완화: 강력한 SHA256과 RFC3161 타임스탬프 서버 사용
        signWithParams: `/fd sha256 /tr http://timestamp.digicert.com /td sha256 ${process.env.WIN_CERT_FILE ? '' : ''}`,
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
