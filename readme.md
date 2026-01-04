# Sourave Halder Template

# Express.js backend Startup template



## Description 
This startup template for backend organize all function, middlewares, utils. There handle error professional way. There also have authorization system etc.


 ## Table of Contents
 
 - [Prerequisites](#prerequisites)
 - [Installation](#installation)
 - [Configuration](#configuration)
 - [Linting and Formatting](#linting-and-formatting)
 - [Running the Application](#running-the-application)
 - [Contributing](#contributing)
 - [License](#license)


## Prerequisites
Before you begin, ensure you have me the following requirements:

* Node.js: Make sure Node.js (version: 20 or higher) is installed. you can download it from [nodejs.org](https://nodejs.org/).
* NPM: Node package Manager (npm) comes with Node.js. 
* Git: git is required for version control. You can download it from [git-scm.com](https://git-scm.com/).


## Installation
```bash
git clone https://github.com/souravh093/express-backend-startup.git
cd express-backend-startup
npm install
```
## Configuration
1. Create a `.env` file in the root directory.
2. Add the required environment variables. For example:
   ```env
   PORT=6000
   DATABASE_URL=postgressql://localhost:27017/your-database
   ```
## Linting and Formatting

### If you want to configuration scratch linting and prettier follow below

1. Install Linting dependence
```bash
npm install -D nodemon ts-node-dev eslint @eslint/js @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier
```
2. Create a `eslint.config.mjs` file in the root directory
3. Add the required code. For example:
```js
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {

      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
```
4. Install Prettier
```bash
npm install --save-dev prettier
```
5. Create a `.prettierrc` file for root directory
6. Add the required code. For example:
```bash
{
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true
}
```
7. Add script in `package.json`
```js
"scripts": {
  "build": "tsc",
  "start:prod": "node ./dist/server.js",
  "start:dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "prettier": "prettier --ignore-path .gitignore --write \"./src/**/*.+(js|ts|json)\"",
  "prettier:fix": "prettier --write src"
}
```


## Running the Application

To start the application in development mode:
```bash
npm run start:dev
```
To start the application in production mode:
```bash
npm run start:prod
```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m "Add some feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


## About the Author
Hi! I'm Sourave Halder, a passionate software developer with expertise in building scalable backend systems using modern technologies like Node.js, Express.js, and TypeScript. I love creating tools and templates that make development faster and more efficient.

If you find this project helpful, feel free to connect with me:

- GitHub: [souravh093](https://github.com/souravh093)
- LinkedIn: [Sourave Halder](https://www.linkedin.com/in/sourave-halder)

## Support This Project
If you like this project, consider giving it a ⭐ on GitHub! Your support helps me create more open-source tools and templates for the developer community.

Happy coding! 🚀
