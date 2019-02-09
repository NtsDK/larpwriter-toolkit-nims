module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "globals":{
        // webpack preload dependencies
        $: false,
        jQuery: false,
        core: false,
        U: false,
        L10n: false,
        UI: false,
        CU: false,
        FileUtils: false,
        Errors: false,

        // my window objects
        DBMS: false,
        SM: false,

        // webpack constants
        MODE: false,
        DEV_OPTS: false,
        PRODUCT: false,
        BASE_FILE_NAME: false
    },
//    "extends": "eslint:recommended",
    "extends": "airbnb" ,
    "rules": {
//        "one-var": ["error", "never"],
//        "one-var-declaration-per-line": ["error", "initializations"],
        "no-use-before-define": ["error", { "variables": false, "functions": false }],
        "comma-dangle": "off",
        "one-var": "off",
        "strict": "off",
        "import/no-unresolved": "off",
        "spaced-comment": "off",
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "func-names": "off",
        "max-len": ["error",  { "code": 200, "tabWidth": 4, "ignoreStrings": true }],
        // "max-len": ["error",  { "code": 120, "tabWidth": 4, "ignoreStrings": true }],
        "one-var-declaration-per-line": "off",
        "prefer-destructuring": ["error", {
            "array": false,
            "object": true
        }],
        "no-param-reassign": "off",
        "no-return-assign": ["error", "except-parens"],
        "no-console": "off",
        "no-unused-vars": "off",
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
