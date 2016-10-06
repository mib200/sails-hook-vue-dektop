'use strict';

// config/webpack.js
var webpack = require('webpack');
var path = require('path');
var WriteFilePlugin = require('write-file-webpack-plugin');
var env = process.env.NODE_ENV || 'development';
var debug = env === 'development';

var entry = [
	path.resolve(__dirname, '../../assets/vueDesktop/src/main.js') // set your main javascript file
];
var plugins = [
	// prevents the inclusion of duplicate code into your bundle
	new webpack.optimize.DedupePlugin(),
	new WriteFilePlugin(),
	new webpack.NoErrorsPlugin(),
	new webpack.LoaderOptionsPlugin({
		// minimize: config.enabled.minify,
		debug: debug,
		stats: {
			colors: true
		},
		// quiet: true,
		options: {
			context: __dirname,
			vue: {
				postcss: [
					require('autoprefixer')({
						browsers: ['last 2 versions']
					})
				]
			},
		}
	})
];

if (debug) {
	// add this entries in order to enable webpack HMR in browser
	entry.push('webpack/hot/dev-server');
	entry.push('webpack-dev-server/client?http://localhost:4000/');

	// HMR plugin
	plugins.push(new webpack.HotModuleReplacementPlugin({
		multiStep: true
	}));
} else {
	// Minify bundle (javascript and css)
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		minimize: true,
		output: {
			comments: false
		},
		compress: {
			drop_console: true
		}
	}));
}

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (sails) {

	sails.config.webpack = {
		config: { // webpack config begin here
			entry: entry,
			output: {
				path: path.resolve(__dirname, '../../.tmp/public/'),
				publicPath: '/',
				filename: 'vueDesktop/js/build/bundle.js'
			},
			// resolveLoader: {
			// 	root: path.join(__dirname, '../../node_modules')
			// },
			resolve: {
				alias: {
					vue: 'vue/dist/vue.js'
				}
			},
			plugins: plugins,
			module: {
				loaders: [ // not all are necessary, choose wisely
					{
						test: /\.vue$/,
						loader: 'vue'
					}, {
						test: /\.(png|jpg|gif|svg)$/,
						loader: 'file',
						query: {
							name: '[name].[ext]?[hash]'
						}
					}, {
						test: /\.(woff2?|eot|ttf|otf)$/,
						loader: 'file',
						query: {
							name: '[name].[ext]?[hash]'
						}
					}, {
						test: /\.js$/,
						loader: 'babel',
						exclude: /(node_modules|bower_components)/,
					}, {
						test: /\.scss$/,
						loaders: ["style", "css", "sass"]
					}
				]
			},
			devtool: '#eval-source-map'
		}, // webpack config ends here
		development: { // dev server config
			// webpack: {}, // separate webpack config for the dev server or defaults to the config above
			config: { // webpack-dev-server config
				// This is handy if you are using a html5 router.
				historyApiFallback: true,
				// set value port as 4000,
				// open your browser at http://localhost:4000/ instead of http://localhost:1337/
				// for develop and debug your application
				port: 4000,
				// enable Hot Module Replacement with dev-server
				// hot: true,
				noInfo: true,
				// sails.js public path
				contentBase: path.resolve(__dirname, '../../.tmp/public/'),
				// bypass sails.js server
				proxy: {
					'*': {
						target: 'http://localhost:1337'
					}
				}
			}
		},
		watchOptions: {
			aggregateTimeout: 300
		}
	};
	// if (!sails.config.webpack || !sails.config.webpack.config) {
	//   sails.log.warn('sails-hook-webpack: No Webpack options have been defined.');
	//   sails.log.warn('sails-hook-webpack: Please configure your config/webpack.js file.');
	//   return {};
	// }

	var config = {
		hook: sails.config.webpack,
		server: sails.config.webpack.development
	};

	var hook = {

		emitReady: false,

		configure: function configure() {},


		/**
		 *
		 * @param next
		 */
		initialize: function initialize(next) {
			next();
		},


		/**
		 * Called after every webpack build.
		 * @param err
		 * @param rawStats
		 * @returns {*}
		 */
		afterBuild: function afterBuild(err, rawStats) {
			if (err) {
				return sails.log.error('sails-hook-webpack: Build error: \n\n', err);
			}

			if (!this.emitReady) {
				sails.emit('hook:sails-hook-webpack:compiler-ready', {});
				this.emitReady = true;
			}

			// emit a built event - hooks like sails-hook-react can then use this
			// to reload sails routes in dev environment builds
			sails.emit('hook:sails-hook-webpack:after-build', rawStats);

			var stats = rawStats.toJson();
			sails.log.debug('sails-hook-webpack: ' + rawStats.toString({
				colors: true,
				chunks: false
			}));

			if (stats.errors.length > 0) {
				sails.log.error('sails-hook-webpack: ', stats.errors);
			}

			if (stats.warnings.length > 0) {
				sails.log.warn('sails-hook-webpack: ', stats.warnings);
			}
			return null;
		}
	};

	// setup outside like this to allow use of the compiler in http.customMiddleware
	hook.compiler = (0, _webpack2.default)(config.hook.config, function (err, stats) {
		if (err) throw err;
		sails.log.info('sails-hook-webpack: Webpack loaded.');
		sails.log.silly('sails-hook-webpack: ', stats.toString());
		if (process.env.NODE_ENV === 'development') {
			sails.log.info('sails-hook-webpack: Watching for changes...');
			hook.compiler.watch(config.hook.watchOptions, hook.afterBuild.bind(hook));
		} else {
			sails.log.info('sails-hook-webpack: Running production build...');
			hook.compiler.run(hook.afterBuild.bind(hook));
		}
	});

	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' && config.server) {
		var WebpackDevServer = require('webpack-dev-server');
		var defaultDevServerConfig = {
			hot: true,
			port: 4000
		};

		// merge defaults
		config.server.config = Object.assign(defaultDevServerConfig, config.server.config || {});

		if (config.server.webpack) {
			hook.devServerCompiler = (0, _webpack2.default)(config.server.webpack);
		}

		hook.devServer = new WebpackDevServer(hook.devServerCompiler || hook.compiler, config.server.config);

		hook.devServer.listen(config.server.config.port);
	}

	return hook;
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj : {
		default: obj
	};
}

/* global sails */
module.exports = exports['default'];