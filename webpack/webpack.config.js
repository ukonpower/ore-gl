module.exports = {
	entry: {
        main: ''
    },
    output: {
        filename: ''
    },
	resolve: {
		modules: ['node_modules'],
		extensions: ['.ts', '.js']
	},
	
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				loader: 'ts-loader',
				options: {
                    configFile: 'webpack/tsconfig/dev.json'
                }
			},
			{
                test: /\.(glsl|vs|fs)$/,
                loader: 'shader-loader',
                options: {
                    glsl: {
                        chunkPath: "src/glsl-chunks"
                    }
                }
            }
		]
	}
};