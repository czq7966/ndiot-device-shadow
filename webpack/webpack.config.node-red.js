const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = env => {
    env = env ? env : {}; //环境变量
    const mode = env.production ? "production" : "development"; //开发或生产模式
    const devtool = env.production || env.nodevtool ? "" : "source-map"; //
    const entry = {}; 
    const plugins = [];
    const optimization = {};  //优化选项
    const minimizer = []; //优化选项：瘦身器
    const externals = [nodeExternals({ modulesFromFile: true })];
    const libraryTarget = env.amd ? 'amd' : env.umd ? 'umd' :  env.cjs ? 'commonjs' : env.cjs2 ? 'commonjs2' : 'commonjs2';
    // const libraryTargetPath =  env.amd ? 'amd' : env.umd ? 'umd' : env.cjs ? 'cjs' : env.old ? '' : 'cjs';
    // const distDir = path.resolve(__dirname, 'dist', libraryTargetPath);
    const distDir = path.resolve(__dirname, '../dist/node-red');
    const srcDir =  path.resolve(__dirname, '../src/node-red');
    entry['shadow-manager'] = path.resolve(srcDir, "shadow-manager.ts");
    
    optimization['minimizer'] = minimizer;  

    plugins.push(
        new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(srcDir, 'package.json'),
                        to: 'package.json',
                    },
                    {
                        from: path.resolve(srcDir, 'README.md'),
                        to: 'README.md',
                    },
                    {
                        from: path.resolve(srcDir, 'nd-device-shadow.js'),
                        to: 'nd-device-shadow.js',
                    },
                    {
                        from: path.resolve(srcDir, 'nd-device-shadow.html'),
                        to: 'nd-device-shadow.html',
                    }                  
                ]
            })        
    )

    if (env.production) {
    }

    const node = {
        __dirname: false,
        __filename: false
    }


    return {
        mode: mode,
        entry: entry,
        devtool: devtool,
        output: {
            path: distDir,
            libraryTarget: libraryTarget,
            filename: "[name].js"
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },
        plugins: plugins,
        optimization: optimization,
        plugins: plugins,
        externals: [
            nodeExternals({ modulesFromFile: true }),
            {
                './package.json': '../../package.json',
                './config.json': '../../config.json',
                'fs': 'fs',
                'path': 'path',
                'http': 'http',
                'https': 'https',
                'zlib': 'zlib',
                'events': 'events'
            }

        ],
        node: node
    }
}

