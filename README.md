# Local development

This project currently requires node.js >=v16.10. If you are using nvm type in `nvm use 16`.
Dependencies are installed using yarn. To enable it simply run `corepack enable`

### To run the demo follow this steps:

1. Run `yarn` to install dependencies
2. Run `yarn start` to open the dev server

### To use the theme in your project:

1. Bump up the package by running `npm version <patch|minor|major>`
2. Publish the package to the registry of your choice `npm publish --registry=<path to your registry>` (for testing purposes you can use local registry such as [verdaccio](https://github.com/verdaccio/verdaccio))
3. Install the theme in your app `npm i react-sortable-tree-theme-wcag-editor` or `yarn add react-sortable-tree-theme-wcag-editor`
4. Import the theme and pass it as a prop to the tree component (check out the [example](https://github.com/lifejuggler/react-sortable-tree-theme-minimal))
