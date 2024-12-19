const {WebpackManifestPlugin} = require('webpack-manifest-plugin');
const staticFiles = require('./staticFiles.cjs');
const _ = require('underscore');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env)=>({
  devtool: 'source-map',
  output: {
    //needed by FontPreloadPlugin
    chunkFilename: 'js/[id]-[contenthash].js',
  },

  experiments: {
    //outputModule:true,
    topLevelAwait: true,
  },

  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    staticFiles(!env.noExternal),
    new MiniCssExtractPlugin({
          filename: 'css/tcposWebDaily.css',
        },
    ),
    new WebpackManifestPlugin({
      filter: f => !f.name.match(/\.map$/),
      generate: (seed, files, entries) => {
        return _(files).reduce((memo, value) => {
          // console.log(seed,files,entries);

          memo[value.name] = value.isChunk ?
              value.chunk.hash :
              new Date().getTime();
          return memo;
        }, {});
      },
    }),

  ],
});
