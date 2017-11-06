# Contributing Guidelines

# Using editorconfig

This is a simple code checker. Right now it used in js folder only.

eclint check app\vtmcl\js
eclint fix app\vtmcl\js
eclint check app\vtmcl\js\capitalApp.js
eclint check app\core\js
eclint fix app\core\js

# Using eslint

"node_modules/.bin/eslint" .eslintrc.js

"node_modules/.bin/eslint" app\vtmcl\js
"node_modules/.bin/eslint" app\vtmcl\js\pageManager.js
"node_modules/.bin/eslint" app\vtmcl\js\pageManager.js --fix