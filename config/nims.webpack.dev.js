const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry: {
        organizer: "./app/nims/js/PageManager.js"
        // organizer: ["ramda", "./app/nims/js/PageManager.js"]
        // organizer: ["babel-polyfill", "./app/nims/js/test.js"]
        // organizer: ["./app/nims/js/test.js"]
    },
    mode: "development",
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
                test: /index.html$/,
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
            Utils: ['core', 'Utils'],
            UI: ['core', 'UI'],
            CommonUtils: ['core', 'CommonUtils'],
            DemoBase: ['core', 'DemoBase'],
            FileUtils: ['core', 'FileUtils'],
            TestUtils: ['core', 'TestUtils'],
            // Export: ['core', 'export'],
            LocalBaseAPI: ['core', 'LocalBaseAPI'],
        })
    ],
    resolve: {
        modules: [
            'node_modules', 
            path.resolve(__dirname, '../app'), 
            path.resolve(__dirname, '../app/nims/js'), 
        ]
    }
};
