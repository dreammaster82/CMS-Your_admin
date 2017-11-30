/**
 * Created by Denis on 04.05.2017.
 */
const path = require('path'),
	adminPath = path.resolve(__dirname, 'public/admin'),
	mainPath = path.resolve(__dirname, 'public'),
	webpack = require('webpack');
console.log(adminPath);
const config = [{
	entry: {
		app: './public/admin/js/index.js'
	},
	output:{
		path: adminPath,
		filename: '[name].js'
	},
	module:{
		noParse: /fabric|tinymce|react-tinymce|darkroom/,
		rules:[
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components|lib)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['react']
					}
				}
			},
			{
				test: /\.json$/,
				use: 'json-loader'
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: true
						}
					},
					{
						loader: 'postcss-loader'
					}
				]
			}
		]
	},
	resolve: {
		alias:{
			'spin-js': `${adminPath}/js/lib/spin.js/spin.js`,
			'tinymce': `${adminPath}/js/lib/tinymce/tinymce.min.js`,
			'react-tinymce': `${adminPath}/js/components/react-tinymce-master/dist/react-tinymce.min.js`,
			'fabric': `${adminPath}/js/lib/fabric/dist/fabric.min.js`,
			'darkroom': `${adminPath}/js/lib/darkroomjs/build/darkroom.js`,
		}
	}
}];
module.exports = function (env) {
	const dev = env && env.development;
	if(dev){
		config[0].devServer = {
            contentBase: adminPath,
            historyApiFallback: true,
            https: true,
            headers:{
                'Access-Control-Allow-Origin': '*'
            },
            host: '127.0.0.1'
		}
        config[0].entry.client = 'webpack-dev-server/client?http://127.0.0.1:8080/';
	}
	return config;
};