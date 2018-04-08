module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    },
    "globals":{
        // common
        FileUtils: false,
        Migrator: false,
        Precondition: false,
        Schema: false,
        Logger: false,
        L10n: false,
        Utils: false,
        CommonUtils: false,
        UI: false,
        Constants: false,
        Errors: false,
        DBMS: false,

        EventEmitter: false,
        dateFormat: false,
        
        BaseExample: false,
        EmptyBase: false,
        Dictionaries: false,
        MODE: false,
        BASE_FILE_NAME: false,
        defaultLang: false,
        
        // libs
        R: false,
        Ajv: false,
        jQuery: false,
        $: false,
        vex: false,
        Ya: false,
        dragula: false,
        PNotify: false,
        ymaps: false,
        saveAs: false,
        CanvasJS: false,
        vis: false,
        markdownit: false,
        JSZip: false,
        Mustache: false,
        Chart: false,
        d3: false,
        klay: false,
        
        // Jasmine
        jasmine: false,
        describe: false,
        beforeAll: false,
        afterAll: false,
        it: false,
        expect: false,
        
        // common pages
        About: false,
        LogViewer: false,
        LogViewer2: false,
        
        // vtmcl pages
        Charsheet: false,
        Instruction: false,
        
        // matcher pages
        marriage: false,
        dataByMonth: true,
        Data: false,
        
        // NIMS pages
        AccessManager: false,
        TextSearch: false,
        Groups: false,
        ProfileFilter: false,
        PermissionInformer: false,
        Register: false,
        Enter: false,
        Player: false,
        Stories: false,
        MasterStory: false,
        MasterManagement: false,
        PlayerManagement: false,
        RelationsPreview: false,
        FilterConfiguration: false,
        GroupProfile: false,
        GroupSchema: false,
        InvestigationBoard: false,
        NetworkSubsetsSelector: false,
        ProfileEditorCore: false,
        ProfileBinding: false,
        CharacterReports: false,
        Adaptations: false,
        Relations: false,
        TestUtils: false,
        
        // NIMS utils
        ProjectUtils: false,
        
        // NIMS constants
        PERMISSION_INFORMER_ENABLED: false,
        TEXT_TEMPLATE: false,
        templatesArr: false,
        
        // utility functions
        makeLocalDBMS: false,
        makeRemoteDBMS: false,
        l10n: false,
        getL10n: false,
        constL10n: false,
        getEl: false,
        getEls: false,
        addClass: false,
        hasClass: false,
        addClasses: false,
        removeClass: false,
        toggleClass: false,
        setClassByCondition: false,
        queryEl: false,
        queryElEl: false,
        queryEls: false,
        addEl: false,
        addEls: false,
        makeEl: false,
        makeText: false,
        clearEl: false,
        setAttr: false,
        getAttr: false,
        delAttr: false,
        setProps: false,
        setStyle: false,
        listen: false,
        strFormat: false,
        fillSelector: false,
        nl2array: false,
        constArr2Select: false,
        setImportantStyle: false,
        remapProps4Select: false,
        queryElEls: false,
        listenOnEnter: false,
        getSelect2Data: false,
        setProp: false,
        arr2Select2: false,
        makeOpt: false,
        getSelectedRadio: false,
        arr2Select: false,
        getSelect2DataCommon: false,
        remapProps: false,
        rAddEl: false,
        rAddClass: false,
        qte: false,
        qmte: false,
        qee: false,
        qe: false,
        qees: false,
        wrapEl: false,
        setError: false,
        clearError: false,
        removeClasses: false,
        setClassIf: false,
        
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
        "spaced-comment": "off",
        "no-underscore-dangle": "off",
        "no-plusplus": "off",
        "max-len": ["error",  { "code": 120, "tabWidth": 4, "ignoreStrings": true }],
        "one-var-declaration-per-line": "off",
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