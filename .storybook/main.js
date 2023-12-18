const custom = require('../webpack.config.js')

module.exports = {
  stories: ['../stories/*.stories.tsx'],
  addons: ['@storybook/addon-styling-webpack'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: (config) => {
    return {
      ...config,
      module: {
        rules: custom.module.rules,
      },
      resolve: {
        ...config.resolve,
        ...custom.resolve,
      },
    }
  },
}
