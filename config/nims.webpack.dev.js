const path = require("path");

module.exports = {
    entry: {
        //organizer: "./app/nims/js/PageManager.js"
        // organizer: ["babel-polyfill", "./app/nims/js/test.js"]
        organizer: ["./app/nims/js/test.js"]
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
                test: /index.html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    { loader: "file-loader", options: { name: "[name].html" } },
                    { loader: "extract-loader" },
                    { loader: "html-loader", options: {interpolate: true} },
                ]
            },
            {
                test: /-(tab|tmpl)\.html$/,
                //include: path.join(__dirname, 'src/views'),
                use: [
                    // { loader: "file-loader", options: { name: "[name].html" } },
                    // { loader: "extract-loader" },
                    { loader: "html-loader" },
                ]
            },
        ]
    }
};
