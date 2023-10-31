# @gramex/chartvalidate

![npm version](https://img.shields.io/npm/v/@gramex/chartvalidate) ![License](https://img.shields.io/npm/l/@gramex/chartvalidate)

A validation library for @gramex charts.

- [Usage](#usage)
- [Features](#features)
- [Testing](#testing)
- [Contribution](#contribution)
- [License](#license)

## Usage

To validate the contents of your package, run:

```bash
npx @gramex/chartvalidate | npx faucet
```

**NO NEED TO INSTALL** - `npx` will automatically install the packages if it's not already installed.

## Tests

This library runs the following tests:

- package.json should be a valid JSON file
- package.json "name" property should start with "@gramex/"
- package.json "version" should be a valid semver and greater than 1.0.0
- package.json "description" property should exist
- package.json "module" should begin with "dist/" and end with ".js"
- package.json "browser" should be the same as "module" but end with ".min.js" instead of ".js"
- package.json "scripts.build" should be defined
- package.json "scripts.prepublishOnly" should be "npm run build"
- package.json "scripts.prepublish" should not be defined
- package.json "files" should be an array that contains at least "README.md" and "dist/\*"
- package.json "repository" should point to a {type: git, url: "git+https://code.gramener.com/..."}
- package.json "keywords" should be defined
- package.json "author" should be defined
- package.json "license" should be "MIT"
- package.json "bugs" should point the same code base as repository, but with "/-/issues" added
- package.json "prettier" should have a "printWidth" of 100 or more
- package.json "homepage" is at https://gramener.com/gramex-<name>/ (if defined)
- package.json "publishConfig" should push to https://registry.npmjs.org/
- .gitlab-ci.yml should be a valid YAML file
- .gitlab-ci.yml should validate build errors
- .gitlab-ci.yml should deploy to package.homepage as static (if defined)

# Contributing

- Fork the repository and clone the fork to your machine.
- Run `npm install` to install dependencies
- Edit [`chartvalidate.js`](chartvalidate.js), documenting your changes
- Push your changes back to your fork on GitHub and submit a pull request to the main repository.

# Release

```shell
npm version minor
npm publish
git push --follow-tags
```

## Release notes

- 1.0.0: 31 Oct 2023. Initial release

## License

MIT

## Support

If you encounter any problems or have suggestions, please [open an issue](https://code.gramener.com/gramex/gramex-chartvalidate/-/issues) or submit a pull request.
