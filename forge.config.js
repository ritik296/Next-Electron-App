module.exports = {
    publishers: [
      {
        name: '@electron-forge/publisher-github',
        config: {
          repository: {
            owner: 'ritik296',
            name: 'Next-Electron-App'
          },
          prerelease: false,
          draft: true
        }
      }
    ]
  }