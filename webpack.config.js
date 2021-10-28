const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.mjs',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
      rules: [
        {
          test: /\.txt$/,
          use: [
            {
              loader: 'html-loader',
              options: {minimise: true}
            }
          ]
        },
        {
            test: /\.css$/,
            use: [
                'style-loader',
                'css-loader'
            ]   
        },

      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './dist/index.html',
        filename: "./index.html"
      }),
    ]
};
