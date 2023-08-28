# ts-cyclomatic-complexity [![license][license-image]][license-url] [![npm][npm-image]][npm-url]

[![coverage][nyc-cov-image]][github-url] [![dependency][depencency-image]][dependency-url] [![maintenance][maintenance-image]][npmsio-url] [![quality][quality-image]][npmsio-url]

`ts-cyclomatic-complexity` - Cyclomatic complexities for Typescript

## CI Status

| Workflow Name | Status |
|:-:|:-:|
| **Build** | [![GitHub CI (Build)][github-build-image]][github-build-url] |
| **CodeQL** | [![GitHub CI (CodeQL)][github-codeql-image]][github-codeql-url] |
| **Coverage** | [![GitHub CI (Coverage)][github-coverage-image]][github-coverage-url] |

## Usage

```yaml
- uses: kei-g/ts-cyclomatic-complexity@main
  with:
    # The file path to tsconfig.json.
    #
    # Default: 'tsconfig.json'
    - tsconfigPath: 'tsconfig.cyclomatic-complexity.json'
```

## Action Outputs

| Output Name | Description |
|:-:|-|
| **average** | An average value of cyclomatic complexities. |
| **maximum** | The maximum value of cyclomatic complexities. |
| **minimum** | The minimum value of cyclomatic complexities. |
| **whole-result** | The whole result styled in JSON. |

## Installation

```shell
npm i ts-cyclomatic-complexity@latest
```

## License

The scripts and documentation in this project are released under the [BSD-3-Clause License](https://github.com/kei-g/ts-cyclomatic-complexity/blob/main/LICENSE)

## Contributions

Contributions are welcome! See [Contributor's Guide](https://github.com/kei-g/ts-cyclomatic-complexity/blob/main/CONTRIBUTING.md)

### Code of Conduct

:clap: Be nice. See [our code of conduct](https://github.com/kei-g/ts-cyclomatic-complexity/blob/main/CODE_OF_CONDUCT.md)

[depencency-image]:https://img.shields.io/librariesio/release/npm/ts-cyclomatic-complexity?logo=nodedotjs
[dependency-url]:https://npmjs.com/package/ts-cyclomatic-complexity?activeTab=dependencies
[github-build-image]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/build.yml/badge.svg
[github-build-url]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/build.yml
[github-codeql-image]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/codeql.yml/badge.svg
[github-codeql-url]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/codeql.yml
[github-coverage-image]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/coverage.yml/badge.svg
[github-coverage-url]:https://github.com/kei-g/ts-cyclomatic-complexity/actions/workflows/coverage.yml
[github-url]:https://github.com/kei-g/ts-cyclomatic-complexity
[license-image]:https://img.shields.io/github/license/kei-g/ts-cyclomatic-complexity
[license-url]:https://opensource.org/licenses/BSD-3-Clause
[maintenance-image]:https://img.shields.io/npms-io/maintenance-score/ts-cyclomatic-complexity?logo=npm
[npm-image]:https://img.shields.io/npm/v/ts-cyclomatic-complexity.svg?logo=npm
[npm-url]:https://npmjs.com/package/ts-cyclomatic-complexity
[npmsio-url]:https://npms.io/search?q=%40kei-g%2Fts-cyclomatic-complexity
[nyc-cov-image]:https://img.shields.io/nycrc/kei-g/ts-cyclomatic-complexity?config=.nycrc.json&label=coverage&logo=mocha
[quality-image]:https://img.shields.io/npms-io/quality-score/ts-cyclomatic-complexity?logo=npm
