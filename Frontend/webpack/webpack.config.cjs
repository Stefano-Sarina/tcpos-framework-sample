const commonConfig = require("./webpack.config.common.cjs");
const allsourcesConfig = require("./webpack.config.dev.cjs");
const productionConfig = require("./webpack.config.prod.cjs");
const { merge } = require('webpack-merge');

module.exports = (env, args) => {
  const common = commonConfig(env, args);
  switch (args.mode) {
    case 'development':
      //if (env.sources == "all"){

        const merged = merge(common, allsourcesConfig);
        merged.externals = undefined;
        return merged;
      //}
      //return merge(common, allsourcesConfig);
    case 'production':
      return merge(common, productionConfig(env));
    default:
      throw new Error('No matching configuration was found!'+args.mode);
  }
}