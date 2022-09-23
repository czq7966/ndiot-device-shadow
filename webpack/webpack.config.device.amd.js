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
    const distDir = path.resolve(__dirname, env.distDir ? env.distDir : '../dist/node-red/amd');
    const srcDir =  path.resolve(__dirname, '../src/device/amd');
    entry['device/index'] = path.resolve(srcDir, "device/index.ts");
    entry['z2m/mqtt/index'] = path.resolve(srcDir, "z2m/mqtt/index.ts");
    entry['z2m/com/index'] = path.resolve(srcDir, "z2m/com/index.ts");
    entry['z2m/tcp/index'] = path.resolve(srcDir, "z2m/tcp/index.ts");
    entry['modbus/ac-pgdtm7000-f/index'] = path.resolve(srcDir, "modbus/ac-pgdtm7000-f/index.ts");
    entry['modbus/ac-hisense-hcpc-h2m1c/index'] = path.resolve(srcDir, "modbus/ac-hisense-hcpc-h2m1c/index.ts");
    entry['ct-dooya-dvq24gf/index'] = path.resolve(srcDir, "ct-dooya-dvq24gf/index.ts");
    entry['rfir/rfir-penet-ir-8285/index'] = path.resolve(srcDir, "rfir/rfir-penet-ir-8285/index.ts");
    
    optimization['minimizer'] = minimizer;  

    const node = {
        __dirname: false,
        __filename: false,
        process: false
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
        // plugins: plugins,
        // optimization: optimization,
        // plugins: plugins,
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
                'events': 'events',
                'net': 'net',
                'child_process': 'child_process',
                'is-utf8': 'is-utf8',
                'js-yaml': 'js-yaml',
                'fs.notify': 'fs.notify',
                'mqtt': 'mqtt',
                'iconv-lite': 'iconv-lite'
            }

        ]
    }
}

