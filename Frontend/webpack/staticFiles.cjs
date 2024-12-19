const HtmlWebpackDeployPlugin = require('html-webpack-deploy-plugin');
const path = require('path');
module.exports = (addExternals) => new HtmlWebpackDeployPlugin({
  addPackagesPath: packagePath => path.join('js', packagePath),
  getPackagePath: (packageName, packageVersion, packagePath) => path.join(/* packageName + '-' + packageVersion, */
      packagePath),
  addAssetsPath: packagePath => packagePath,
  useHash: true,
  assets: {
    copy: [
      /* {
         from: path.resolve(__dirname, '../public/images/'),
         to: 'images',
       },*/
      {from: path.resolve(__dirname, '../public/config/'), to: 'config'},
      {from: path.resolve(__dirname, '../locales/'), to: 'config/locales'},
    ],
    /*scripts:[
      'themes/theme_ovosodo/index.js',
      'themes/theme_blueSea/index.js',
    ],*/
  },
  packages: {
    /** if external flag is set we are producing a full build so we move external files*/
    ...(addExternals ? {} : {}),
    /*'@tcpos/backoffice-lang': {
      copy: [
        {from: 'locale.json', to: '../config/locales/locale.json'},
      ],
    },*/
    '@tcpos/common-components': {
      copy: [
        {from: 'dist/css/style.css', to: '../css/tcposCommonComponents.css'},
        //    {from: 'dist/fonts', to: '../fonts',},
        {from: 'dist/images', to: '../images'},
      ],
      links: {
        variableName: 'tcposCommonComponents',
        path: '../css/tcposCommonComponents.css',
      },
    },

    '@tcpos/backoffice-components': {
      copy: [
        {from: 'dist/css', to: '../css'},
        {from: 'dist/fonts', to: '../fonts'},
      ],

      links: {
        variableName: 'tcposWebDailyComponents',
        path: '../css/tcposWebDailyComponents.css',
      },
    },

  },
});
