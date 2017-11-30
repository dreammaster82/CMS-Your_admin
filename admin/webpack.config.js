/* eslint-disable no-tabs */
/**
 * Created by Denis on 04.05.2017.
 */
const path = require('path'),
	webpack = require('webpack'),
	currentPath = path.resolve(__dirname),
	envJson = require('../config/env.json');

const processEnv = Object.assign({}, process.env, envJson);
const config = [{
	entry: {
		app: './js/index.js'
	},
	output: {
		path: path.resolve(__dirname, 'build'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|lib)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['react'],
                        plugins: [require('babel-plugin-transform-object-rest-spread')]
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
						loader: 'css-loader'
					},
					{
						loader: 'postcss-loader'
					}
				]
			}
		]
	},
	resolve: {
		alias: {
			'tinymce': `${currentPath}/js/lib/tinymce/tinymce.min.js`
		},
		modules: ["../admin/node_modules", "node_modules"]
	},
    plugins: [
        new webpack.ProvidePlugin({tinymce: 'tinymce'})
	]
}];
module.exports = function(env) {
	const dev = env && env.development;
	if (dev) {
		config[0].devServer = {
			contentBase: path.resolve(__dirname, '../'),
			historyApiFallback: {
				index: '/admin/'
			},
			https: true,
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			host: 'devserver.ts',
			port: 80,
            publicPath: '/admin/',
			proxy: {
				'/api': 'http://localhost:3000'
            }
		};
	}
	config[0].plugins.push(
        new webpack.DefinePlugin({
            REST_API: JSON.stringify(env.restApi || processEnv.restApi),
			APP_ID: JSON.stringify(env.appId || processEnv.appId),
            APP_SECRET: JSON.stringify(env.appSecret || processEnv.appSecret)
        })
	);

	return config;
};
