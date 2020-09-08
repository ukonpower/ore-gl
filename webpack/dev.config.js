const path = require( 'path' );

module.exports = {
	entry: {
	},
	output: {
	},
	resolve: {
		modules: [ 'node_modules' ],
		extensions: [ '.ts', '.js' ],
		alias: {
			"@ore-three-ts": path.resolve( __dirname, '../src/common/ts/ore-three-ts/src' ),
			"@glpower": path.resolve( __dirname, '../src/common/ts/glpower/src' )
		},
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
