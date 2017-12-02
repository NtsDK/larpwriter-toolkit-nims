# Contributing Guidelines

# Using editorconfig

This is a simple code checker. Right now it used in js folder only.

    eclint check app\core\js
    eclint fix app\core\js
    
    eclint check app\vtmcl\js
    eclint fix app\vtmcl\js
    eclint check app\vtmcl\js\capitalApp.js
    eclint check app\measurelook\js
    eclint fix app\measurelook\js


# Using eslint

    "node_modules/.bin/eslint" .eslintrc.js
    
    "node_modules/.bin/eslint" app\core\js
    "node_modules/.bin/eslint" app\core\js --fix
    
    "node_modules/.bin/eslint" app\vtmcl\js
    "node_modules/.bin/eslint" app\vtmcl\js --fix
    "node_modules/.bin/eslint" app\vtmcl\js\pageManager.js
    "node_modules/.bin/eslint" app\vtmcl\js\pageManager.js --fix
    
    "node_modules/.bin/eslint" app\measurelook\js
    "node_modules/.bin/eslint" app\measurelook\js --fix