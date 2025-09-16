module.exports = {
  appId: 'com.teenyai.browser',
  productName: 'TeenyAI',
  copyright: 'Copyright © 2024 TeenyAI',
  directories: {
    output: 'release'
  },
  files: [
    'build/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  publish: [
    {
      provider: 's3',
      bucket: process.env.AWS_S3_BUCKET || 'teenyai-updates',
      region: process.env.AWS_REGION || 'us-east-1',
      path: 'updates/'
    },
    {
      provider: 'github',
      owner: process.env.GITHUB_OWNER || 'your-username',
      repo: process.env.GITHUB_REPO || 'TeenyAI'
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    publisherName: 'TeenyAI'
  },
  mac: {
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    category: 'public.app-category.productivity'
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    category: 'Network'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'assets/icon.ico',
    uninstallerIcon: 'assets/icon.ico',
    installerHeaderIcon: 'assets/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
};