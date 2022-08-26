## Install & Start

⚠️ Using [Yarn Package Manager](https://yarnpkg.com) is recommended over `npm`.

Create React App with the template

```shell
yarn start
```
This will run scripts and setup a local Development environment that can be used with OBS by opening up browser, custom, or page targeted resources for overlay use. Feel free to use this code in other ways.

See `package.json` for Scripts
[`package.json`](package.json)

- [ ] This still needs to be worked on and then documented

```json
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "start:prod": "yarn run build && serve -s build",
    "test:generators": "ts-node ./internals/testing/generators/test-generators.ts",
    "checkTs": "tsc --noEmit",
    "eslint": "eslint --ext js,ts,tsx",
    "lint": "yarn run eslint src",
    "lint:fix": "yarn run eslint --fix src",
    "lint:css": "stylelint src/**/*.css",
    "generate": "plop --plopfile internals/generators/plopfile.ts",
    "cleanAndSetup": "ts-node ./internals/scripts/clean.ts",
    "prettify": "prettier --write",
    "extract-messages": "i18next-scanner --config=internals/extractMessages/i18next-scanner.config.js"
  },
```

---

## Current Features

- Simple Magic the Gathering Card Search and Overlay using the Scryfall API is the current only working feature.
---

## Planed Features

- Plugin style components that show the overlays from different types of data sources
- Host and hotswappable data both for local API's and remote Ones
- Connect and links ready for other data sources and remote controls
- OBS and maybe other streaming app integration with an Actual plugin

---

## Special thanks to the project below:

<img width="914" alt="React Boilerplate Meets CRA" src="https://user-images.githubusercontent.com/3495307/80274591-2d5daa00-86e4-11ea-8fba-404f1cdba87e.png" align="center">
<br />

<div align="center" >Crafted for <strong>highly scalable</strong> & <strong>performant</strong> and <strong>easily maintainable</strong> React.js applications <br /> 
with a focus on  
<strong>best DX</strong> and <strong>best practices</strong>.
</div>

<br />

<div align="center">
  <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/actions?query=workflow%3Abuild">
    <img src="https://github.com/react-boilerplate/react-boilerplate-cra-template/workflows/build/badge.svg" alt="Build Status" />
  </a>
  <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/actions?query=workflow%3Atests">
    <img src="https://github.com/react-boilerplate/react-boilerplate-cra-template/workflows/test/badge.svg" alt="Tests Status" />
  </a>
  <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/actions?query=workflow%release">
    <img src="https://github.com/react-boilerplate/react-boilerplate-cra-template/workflows/release/badge.svg" alt="Release Status" />
  </a>
</div>

<div align="center">
  <a href="https://coveralls.io/github/react-boilerplate/react-boilerplate-cra-template">
    <img src="https://coveralls.io/repos/github/react-boilerplate/react-boilerplate-cra-template/badge.svg?branch=master" alt="Coverage" />
  </a>
  <a href="https://opencollective.com/react-boilerplate">
    <img src="https://opencollective.com/react-boilerplate/backers/badge.svg" alt="Backers" />
  </a>
  <a href="https://opencollective.com/react-boilerplate/">
    <img src="https://opencollective.com/react-boilerplate/sponsors/badge.svg" alt="Sponsors" />
  </a>
</div>

<br />

---

The official [Create React App](https://github.com/facebook/create-react-app) template of the `discontinued` [React Boilerplate](https://github.com/react-boilerplate/react-boilerplate)

Start your `create-react-app` projects in seconds with the best, industry-standard tools and practices made ready for you.

**📚 Documentation:** [Gitbook](https://cansahin.gitbook.io/react-boilerplate-cra-template/)

**🎨 Check the example app:** [Demonstrating the features](https://react-boilerplate.github.io/react-boilerplate-cra-template/)

**📂 Browse in VS Code:** [![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://open.vscode.dev/react-boilerplate/react-boilerplate-cra-template)

**📦 Package:** [npm](https://www.npmjs.com/package/cra-template-rb)

![version](https://img.shields.io/npm/v/cra-template-rb)
![version](https://img.shields.io/npm/dm/cra-template-rb)

---

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/Can-Sahin"><img src="https://avatars2.githubusercontent.com/u/33245689?s=80" width="80px;" alt=""/><br /><sub><b>Can Sahin</b></sub></a><br /><a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=Can-Sahin" title="Code">💻</a> <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=Can-Sahin" title="Documentation">📖</a> <a href="#ideas-Can-Sahin" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/pulls?q=is%3Apr+reviewed-by%3ACan-Sahin" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=Can-Sahin" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/receptiryaki"><img src="https://avatars0.githubusercontent.com/u/3495307?s=80" width="80px;" alt=""/><br /><sub><b>Recep Tiryaki</b></sub></a><br /><a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=receptiryaki" title="Code">💻</a> <a href="#ideas-receptiryaki" title="Ideas, Planning, & Feedback">🤔</a> <a href="#design-receptiryaki" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/mogsdad"><img src="https://avatars3.githubusercontent.com/u/1707731?s=80" width="80px;" alt=""/><br /><sub><b>David Bingham</b></sub></a><br /><a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=mogsdad" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/lourensdev"><img src="https://avatars.githubusercontent.com/u/5746141?v=4?s=80" width="80px;" alt=""/><br /><sub><b>Lourens de Villiers</b></sub></a><br /><a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=lourensdev" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/rejochandran"><img src="https://avatars.githubusercontent.com/u/4696985?v=4?s=80" width="80px;" alt=""/><br /><sub><b>Rejo Chandran</b></sub></a><br /><a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=rejochandran" title="Code">💻</a> <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=rejochandran" title="Documentation">📖</a> <a href="https://github.com/react-boilerplate/react-boilerplate-cra-template/commits?author=rejochandran" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

This project is licensed under the MIT license, Copyright (c) 2019 Maximilian Stoiber.
For more information see `LICENSE.md`.
