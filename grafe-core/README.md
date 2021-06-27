# Welcome to grafe-core

[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://grafe-framework.com/documentation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/grafe-team/grafe-framework/blob/main/LICENSE)

> This is the core module of grafe. With the help of the core, all routes are created according to the corresponding folder structure.

### !!!This is an beta version, the appearance of bugs is expected. These can be reported via our [issues page](https://github.com/grafe-team/grafe-framework/issues)!!!

### 🏠 [Homepage](https://grafe-framework.com)

## Install

```sh
npm install @grafe/grafe-core
```

## Usage

```ts
import { initCore } from '@grafe/grafe-core';
import express = requrie('express');

const app = express();

initCore('../grafe.json', app);
```

## Author

👤 **[Streimel Stefan](https://github.com/streimelstefan)**
👤 **[Koch Marvin](https://github.com/kochmarvin)**

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/grafe-team/grafe-framework/issues).

## 📝 License

This project is [MIT](https://github.com/grafe-team/grafe-framework/blob/main/LICENSE) licensed.
