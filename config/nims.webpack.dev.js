const path = require("path");
const webpack = require('webpack');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const serverEntry = {
    organizer: "./app/nims/js/organizer.js",
    index: "./app/nims/js/index.js",
}
const standaloneEntry = {
    organizer: "./app/nims/js/organizer.js",
}

const config = {
    // entry: {
    //     organizer: "./app/nims/js/organizer.js",
    //     index: "./app/nims/js/index.js",
    // },
    // mode: "development",
    output: {
        filename: "[name]-bundle.js",
        path: path.resolve(__dirname, "../dist"),
        publicPath: "/"
    },
    devServer: {
        contentBase: "dist",
        overlay: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [{ loader: "babel-loader" }],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{ loader: "style-loader" }, { loader: "css-loader" }]
            },
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            {
                test: /(nims|index).html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    { loader: "file-loader", options: { name: "[name].html" } },
                    { loader: "extract-loader" },
                    { loader: "html-loader", options: {interpolate: true} },
                ]
            },
            {
                test: /-(tab|tmpl|template|form|dialog|commons)\.html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    // { loader: "file-loader", options: { name: "[name].html" } },
                    // { loader: "extract-loader" },
                    { loader: "html-loader" },
                ]
            },
        ]
    },
    plugins:[
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            R: 'ramda',

            core: 'core',
            U: ['core', 'U'],
            L10n: ['core', 'L10n'],
            UI: ['core', 'UI'],
            CU: ['core', 'CU'],
            FileUtils: ['core', 'FileUtils'],
        }),
        // new BundleAnalyzerPlugin({
        //     analyzerMode: 'static'
        // })
    ],
    resolve: {
        modules: [
            'node_modules', 
            path.resolve(__dirname, '../app'), 
            path.resolve(__dirname, '../app/nims'), 
            path.resolve(__dirname, '../app/nims/js'), 
        ],
        alias: []
    }
}

module.exports = module.exports = (env, argv) => {
    switch(env.mode) {
    case 'production':
        config.mode = 'production';
        break;
    default:
        console.error('Unknown mode "' + argv.mode + '" switch to default: development');
    case 'development':
        config.devtool = 'source-map';
        config.mode = 'development';
        break;
    }

    switch(env.product) {
    case 'server':
        config.entry = serverEntry;
        break;
    default:
        console.error('Unknown product "' + argv.mode + '" switch to default: standalone');
    case 'standalone':
        config.entry = standaloneEntry;
        config.resolve.alias.push({
            alias: "nims/js/dbms/localPermissionInformer",
            name: "permissionInformer",
            onlyModule: true
        });
        config.resolve.alias.push({
            alias: "nims/js/dbms/localDBMS",
            name: "DBMSFactory",
            onlyModule: true
        });
        break;
    }
    return config;
};
