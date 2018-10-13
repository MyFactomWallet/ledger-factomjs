const path = require('path');

module.exports = {
    mode: 'production',
    entry: { 
        'index-browser': './src/index-browser.js'
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        library: '[name]',
        libraryTarget: 'umd'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/env'],
                    plugins: ['@babel/transform-runtime', '@babel/transform-async-to-generator',  '@babel/transform-modules-commonjs']
                }
            }
        }]
    },
};
