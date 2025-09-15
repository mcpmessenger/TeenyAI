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
  win: {
    target: 'portable',
    publisherName: 'TeenyAI'
  },
  mac: {
    target: 'zip'
  },
  linux: {
    target: 'AppImage'
  }
};