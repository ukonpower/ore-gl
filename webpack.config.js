import path from 'path';
module.exports = {
    mode: "development",
    entry: {
        main: './src/js/main.js'
    },
    output: {
        filename: 'script.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(glsl|vs|fs)$/,
                loader: 'shader-loader',
                options: {
                    glsl: {
                        chunkPath: path.resolve("/glsl/chunks")
                    }
                }
            }
        ]
    }
};