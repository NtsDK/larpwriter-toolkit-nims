const path = require('path');
const webpack = require('webpack');

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const serverEntry = {
    organizer: './app/nims/pages/organizer.js',
    index: './app/nims/pages/index.js',
    player: './app/nims/pages/player.js',
};
const standaloneEntry = {
    organizer: './app/nims/pages/organizer.js',
};

const distPath = path.resolve(__dirname, '../dist');

const config = {
    // entry: {
    //     organizer: "./app/nims/js/organizer.js",
    //     index: "./app/nims/js/index.js",
    // },
    // mode: "development",
    output: {
        filename: '[name]-bundle.js',
        path: distPath,
        publicPath: '/'
    },
    devServer: {
        contentBase: 'dist',
        overlay: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{ loader: 'babel-loader' }],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader' // compiles Sass to CSS, using Node Sass by default
                ]
            },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            {
                test: /(nims|index|player).html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    { loader: 'file-loader', options: { name: '[name].html' } },
                    { loader: 'extract-loader' },
                    { loader: 'html-loader', options: { interpolate: true } },
                ]
            },
            {
                test: /-(tab|tmpl|template|form|dialog|commons)\.html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    // { loader: "file-loader", options: { name: "[name].html" } },
                    // { loader: "extract-loader" },
                    { loader: 'html-loader' },
                ]
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            R: 'ramda',

            // app
            core: 'core',
            U: ['core', 'U'],
            L10n: ['core', 'L10n'],
            UI: ['core', 'UI'],
            FileUtils: ['core', 'FileUtils'],

            // dbms
            Constants: 'nims/constants',
            CU: 'core/commonUtils',
            Errors: 'core/errors',
            // CU: ['core', 'CU'],
            // Errors: ['core', 'Errors'],
        }),
        new CleanWebpackPlugin([distPath], {
            root: process.cwd(),
        }),
        // eslint-disable-next-line no-useless-escape
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(ru|en)/)
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'static'
        // })
    ],
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, '../app'),
            path.resolve(__dirname, '../app/nims'),
            path.resolve(__dirname, '../dbms'),
            path.resolve(__dirname, '../dbms/nims'),
        ],
        alias: []
    }
};

module.exports = (env, argv) => {
    switch (env.mode) {
    case 'production':
        config.mode = 'production';
        break;
    default:
        console.error(`Unknown mode "${argv.mode}" switch to default: development`);
    // eslint-disable-next-line no-fallthrough
    case 'development':
        config.devtool = 'cheap-eval-source-map';
        // config.optimization = {
        //     // usedExports:true,
        //     // splitChunks: {
        //     //     chunks: 'all'
        //     // }
        // };
        // config.devtool = 'source-map';
        config.mode = 'development';
        break;
    }

    switch (env.product) {
    case 'server':
        config.entry = serverEntry;
        config.resolve.alias.push({
            alias: 'nims/js/dbms/remotePermissionInformer',
            name: 'permissionInformer',
            onlyModule: true
        });
        config.resolve.alias.push({
            alias: 'nims/js/dbms/remoteDBMS',
            name: 'DBMSFactory',
            onlyModule: true
        });
        break;
    default:
        console.error(`Unknown product "${argv.product}" switch to default: standalone`);
    // eslint-disable-next-line no-fallthrough
    case 'standalone':
        config.entry = standaloneEntry;
        config.resolve.alias.push({
            alias: 'front-db/localPermissionInformer',
            name: 'permissionInformer',
            onlyModule: true
        });
        config.resolve.alias.push({
            alias: 'front-db/DbmsFactory',
            name: 'DbmsFactory',
            onlyModule: true
        });
        break;
    }

    const valOrDefault = (val, defaultVal) => (val !== undefined ? Boolean(val) : defaultVal);

    const DEV_OPTS = {
        ENABLE_TESTS: valOrDefault(env.ENABLE_TESTS, true),
        ENABLE_BASE_SELECT_DLG: valOrDefault(env.ENABLE_BASE_SELECT_DLG, false),
        ENABLE_BASICS: valOrDefault(env.ENABLE_BASICS, true),
        ENABLE_EXTRAS: valOrDefault(env.ENABLE_EXTRAS, false)
    };

    config.plugins.push(new webpack.DefinePlugin({
        PRODUCT: JSON.stringify(env.product === 'server' ? 'SERVER' : 'STANDALONE'),
        MODE: JSON.stringify(env.mode === 'production' ? 'PROD' : 'DEV'),
        BASE_FILE_NAME: JSON.stringify('nims'),
        DEV_OPTS
    }));
    return config;
};
