const path = require('path');
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
    const distDir = path.resolve(__dirname, '../dist/test');
    const srcDir =  path.resolve(__dirname, '../src/test');
    entry['index'] = path.resolve(srcDir, "index.ts");
    
    optimization['minimizer'] = minimizer;  

    plugins.push()

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
                'zlib': 'zlib'
            }

        ],
        node: node
    }
}

