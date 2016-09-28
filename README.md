# sails-hook-vue2-webpack2-sass

Sails.js hook that provides a Vue.js 2.0 frontend using Webpack 2.0 with SASS compilation.

## Install

```sh
npm install sails-hook-vue2-webpack2-sass --save
```

## Getting started

You have to create your Sails project using the `--no-frontend` option or disable the grunt hook in your `.sailsrc`
```
  "hooks": {
    "grunt": false
  }
```

Configure babel by copying the following lines in the `.babelrc` file at the root of your project's folder
```
{
	"presets": [
		["es2015", { "modules": false }],
		"stage-2"
	],
	"plugins": ["transform-runtime"],
	"comments": false
}
```

Place `src` folder with `main.js` and `*.vue` source files inside assets folder of sails, the index file `index.html` can come directly in assets directory.

Refer to the [Vue.js documentation](http://vuejs.org/guide/) for the content of these files.

## How it works

When lifted, Sails will serve the content of `.tmp/public` on the standard port, which corresponds to your frontend index file.

In development mode, the hook serves a dynamic copy of the bundle using [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) on port `3000`. This provides Hot Module Replacement (HMR) functionality, i.e. changes in source files are reflected automatically in the browser without the need to refresh the page.

In production mode, the bundle is served from the compiled static file `.tmp/public/js/build/bundle.js`.
