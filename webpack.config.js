const MODE = 'production';
const enabledSourceMap = (MODE === 'development');
const path = require('path');
module.exports = {
	mode: MODE,
	entry: './src/js/index.js',
	output: {
		path: `${__dirname}/public/scripts`,
		publicPath:'/scripts/',
		filename: 'main.js'
	},
	devServer: {
		contentBase: path.join(__dirname, 'public'),
		compress: true,
		open: true,
		port: 9000,
		disableHostCheck: true,
		host: '0.0.0.0'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-env',
							]
						}
					}
				]
			},
			{
				test: /\.scss/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							url: false,
							sourceMap: enabledSourceMap,
							importLoaders: 2
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: enabledSourceMap,
						}
					}
				]
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
