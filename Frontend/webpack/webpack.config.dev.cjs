const path = require('path');

const ReactRefreshWebpackPlugin = require(
    '@pmmmwh/react-refresh-webpack-plugin');
const HtmlWebpackDeployPlugin = require('html-webpack-deploy-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const staticFiles = require('./staticFiles.cjs');

/**
 * find dist directory for a tcpos standard package
 * @param packName
 * @returns {string}
 */
function resolveDist(packName) {
  return path.join(path.dirname(require.resolve(packName + '/package.json')),
      'dist');
}

module.exports = {

  resolve: {
    preferRelative: true,
    plugins: [new TsconfigPathsPlugin({/* options: see below */})],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        projectReferences: true,
        configFile: 'tsconfig.json',
      },

    }),
    staticFiles(true),

    new ReactRefreshWebpackPlugin({
      overlay: false,
    }), new HtmlWebpackDeployPlugin({
      addPackagesPath: packagePath => path.join('js', packagePath),
      getPackagePath: (packageName, packageVersion, packagePath) => path.join(/* packageName + '-' + packageVersion, */
          packagePath),
      addAssetsPath: packagePath => packagePath,
      packages: {},
      assets: {
        copy: [
          {from: path.resolve(__dirname, '../public/config/'), to: 'config'},
        ]
      },
    }),

  ],
  devtool: 'eval-cheap-module-source-map',

  devServer: {
    hot: true,
    client: {overlay: {
      errors: true,
      runtimeErrors: false
    }},
    //server: 'https', // Remove
    //allowedHosts: "all", // Remove
    port: 8080,
    historyApiFallback: true/*{htmlAcceptHeaders: ['text/html']}*/,
    open: true,
    static: [
      {
        directory: path.join(__dirname, '../dist'),
      },
      {
        //directory: path.dirname(require.resolve('@tcpos/backoffice-lang/')),
        directory: path.join(__dirname, '../locales'),
        //publicPath: '/config/locales',
        publicPath: '/config/locales'
      }
    ],
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:50000',
        changeOrigin: true,
        secure: false,

      },
      {
        context: [ '/connect', '/Account', '/callback'],
        target: 'http://localhost:50000',
        changeOrigin: true,
        secure: false,
        hostRewrite: 'localhost:8080',
        autoRewrite: true,
      },
      {
        context: ['/signalr'],
        target: 'http://localhost:10001',
        changeOrigin: true,
        ws: true,
      },
    ],
    compress: true,
  },

  /*stats: 'errors-only',*/
  externals: undefined,
};
