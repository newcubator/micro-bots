const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  entry: slsw.lib.entries,
  output: {
    libraryTarget: "commonjs2",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
    assetModuleFilename: "assets/[name][ext]",
  },
  target: "node",
  node: {
    __dirname: false,
    __filename: false,
  },
  devtool: "source-map",
  mode: "development",

  resolve: {
    extensions: [".js", ".jsx", ".json", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.png/,
        type: "asset/inline",
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {},
          },
        ],
      },
    ],
  },
  externals: [nodeExternals()],
};
