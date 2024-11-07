const path = require("path");
const webpack = require("webpack");
const htmlWebPackPlugin = require('html-webpack-plugin');
const copyPlugin = require("copy-webpack-plugin");
const zipPlugin = require('zip-webpack-plugin');
const removePlugin = require('remove-files-webpack-plugin');

module.exports = 
{
    entry: './src/index.js',  
    mode: "development",
    stats: 
    {
        all: false,            // Tüm çıktıların devre dışı bırakılması
        errors: true,          // Sadece hatalar gösterilsin
        warnings: false,       // Uyarılar devre dışı bırakıldı
        modules: false,        // Modüller gösterilmesin
        moduleTrace: false,    // Modül izleme gösterilmesin
        errorDetails: true     // Hatalarla ilgili ayrıntılar gösterilsin
    },
    module: 
    {
        rules: 
        [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: "babel-loader",
                options: 
                { 
                    presets: ["@babel/env"],
                    plugins: ['@babel/plugin-transform-runtime']
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
        ]
    },    
    resolve: 
    { 
        alias: 
        {
            globalize$: path.resolve( __dirname, "node_modules/globalize/dist/globalize.js" ),
            globalize: path.resolve(__dirname, "node_modules/globalize/dist/globalize"),
            cldr$: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr.js"),
            cldr: path.resolve(__dirname, "node_modules/cldrjs/dist/cldr"),
            'path' : false
        },
        extensions: ["*", ".js", ".jsx", ".json"]
    },
    output: 
    {
        path: path.resolve(__dirname, "public/"),
        filename: 'index.js',
    },
    devServer: 
    {
        static: 
        [
            {
                directory: path.join(__dirname, "public")
            }
        ],
        port: 3001,
        proxy: 
        {
            "/socket.io": 
            {
                target: 'http://localhost:81',
                ws: true
            },
            "/api": 
            {  // API istekleri için proxy ekle
                target: 'http://localhost:81',
                secure: false
            }
        },
        client: 
        {
            overlay: 
            {
                warnings: false,  // Uyarıların overlay üzerinde çıkmasını engelle
                errors: true,     // Hatalar gösterilmeye devam etsin
            },
        },
    },
    plugins: 
    [
        new webpack.HotModuleReplacementPlugin(),
        new copyPlugin(
        {
            patterns: 
            [
                { from: "./src/css/", to: "./css/" },
            ]
        }),
        new htmlWebPackPlugin(
        {
            template: './src/index.html',
            filename: 'index.html'
        }),
        new zipPlugin(
        {
            path: './',
            filename: 'public.zip',
            pathPrefix: 'public',
            extension: 'zip'
        }),
        new removePlugin(
        {
            before: 
            {
                include: 
                [
                    './public'
                ]
            }
        }),
    ]
};