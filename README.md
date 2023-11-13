# @gramex/chartvalidate

![npm version](https://img.shields.io/npm/v/@gramex/chartvalidate) ![License](https://img.shields.io/npm/l/@gramex/chartvalidate)

A validation library for @gramex charts.

## Example

To validate the contents of your package, run:

```bash
npx -y @gramex/chartvalidate
```

## Installation

**NO NEED TO INSTALL** - `npx` will automatically install the packages if it's not already installed.

Just run:

```bash
npx @gramex/chartvalidate | npx faucet
```

## Tests

This library runs the following tests:

- package.json should be a valid JSON file
- package.json "name" property should start with "@gramex/"
- package.json "version" should be a valid semver and greater than 1.0.0
- package.json "description" property should exist
- package.json "module" should begin with "dist/" and end with ".js"
- package.json "browser" should be the same as "module" but end with ".min.js" instead of ".js"
- package.json "scripts.build" should be defined
- package.json "scripts.lint" should run prettier and eslint
- package.json "scripts.prepublishOnly" should lint and build
- package.json "scripts.prepublish" should not be defined
- package.json "files" should include "README.md", module, browser
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
- README.md should begin with a H1 with the package name
- README.md should have "Example" as the first H2
- README.md should have the next 2nd-level heading as "Installation"
- README.md should an "API" 2nd-level heading
- README.md should end with Release Notes, Authors and License 2nd-level headings

## API

## Contributing

- Fork the repository and clone the fork to your machine.
- Run `npm install` to install dependencies
- Edit [`chartvalidate.js`](chartvalidate.js), documenting your changes
- Push your changes back to your fork on GitHub and submit a pull request to the main repository.

## Release

```shell
npm version minor
npm publish
git push --follow-tags
```

## Support

If you encounter any problems or have suggestions, please [open an issue](https://code.gramener.com/gramex/gramex-chartvalidate/-/issues) or submit a pull request.

## Release notes

- 1.3.0: 13 Nov 2023. Add README.md header validations
- 1.2.0: 1 Nov 2023. Add linting
- 1.0.0: 31 Oct 2023. Initial release

## Authors

- Anand S <s.anand@gramener.com>

## License

[MIT](https://spdx.org/licenses/MIT.html)
