const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require("webpack");
const fs = require('fs');
const versionHistory = require('./update-version-history.cjs');
const packageJSON = require('../package.json');
const {ModuleFederationPlugin} = require('webpack').container;
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const ModuleFederationAutoMapper = require("@tcpos/common-module-federation-automapper");


//.
const baseTSProps = {
  transpileOnly: true,
  // experimentalWatchApi: true,
};

const targetFile= `${__dirname}/../public/config/versionHistory.json`;
versionHistory.updateVersionHistory(targetFile);

module.exports = (env, args) => {
  const dev = args.mode == 'development';
  return {
    target: ['web', 'es6'],

    context: path.resolve(__dirname, '../'),
    entry: {
      'js/tcposBackofficeSampleApp': path.resolve(__dirname, '../src/index.tsx'),
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,

          options: dev ? {
            ...baseTSProps,
            transpileOnly: true,
            configFile: 'tsconfig-allsources.json',
            projectReferences: true,
            getCustomTransformers: () => ({
              before: [
                require('react-refresh-typescript')(),

              ],
            }),
          } : baseTSProps,

        },
        {
          //test: /\.(png|svg|jpg|jpeg|gif|ttf|json)$/i, "json" removed because of ajv error
          test: /\.(png|svg|jpg|jpeg|gif|ttf)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'images/[name][ext]',
          },
        },
        {
          test: /\.(css|s[ac]ss)$/i,
          use: dev ? [

            'style-loader',
            // Translates CSS into CommonJS
            'css-loader',

            // Compiles Sass to CSS
            {
              loader: 'sass-loader',
              options: {
                // Prefer `dart-sass`
                implementation: require.resolve('sass'),
              },
            },
          ] : [
            MiniCssExtractPlugin.loader,

            // Translates CSS into CommonJS
            'css-loader',
            // Compiles Sass to CSS
            {
              loader: 'sass-loader',
              options: {
                // Prefer `dart-sass`
                implementation: require.resolve('sass'),
              },
            },
          ],
        },
      ],
    },
    resolve: {
      preferRelative: true,
      extensions: ['.tsx', '.ts', '.js'],
      fallback: { "url": require.resolve("url/") }
    },
    output: {
      path: path.resolve(__dirname, '../dist/'),

      publicPath: '/',
      filename: '[name]-[contenthash].js',
      chunkFilename:'[name]-[chunkhash].js',
      clean: true,
    },
    plugins: [

      new HtmlWebpackPlugin({
        title: 'TCPOS@Next WebDaily test page',
        minify: false,
        scriptLoading: 'blocking',
        inject: 'head',
        hash:true,
        template: path.join(__dirname, '../public', 'index.html'),
        favicon: path.join(__dirname, '../public', 'favicon.ico'),
      }),
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(require('../package.json').version),
      }),
      new ModuleFederationPlugin({

        name: 'BackofficeSampleApp',

        shared: ModuleFederationAutoMapper(packageJSON)

      }),
    ],

    optimization: {
      chunkIds: 'named',
      moduleIds: 'named',
      splitChunks:false,
      //minification breaks sub packages as tcposCore etc
      minimize: false,
      /*  minimizer: [
          new TerserPlugin({
            terserOptions: {
              keep_classnames: true,
              keep_fnames: true,
            },
          })],*/
    },
    watchOptions: {
      ignored: ['**/node_modules', '.cache', '*.d.ts', '**/types'],
    },
  };
};
