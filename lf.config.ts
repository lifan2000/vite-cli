const path = require('path');
const newConfig = {
    resolve: {
        alias: {
            '@proto': path.join(__dirname, './src/types/proto.d.ts'),
            '@images': path.join(__dirname, './public/images'),
            '@public': path.join(__dirname, './public'),
            '@app': path.join(__dirname, './src/app'),
            '@common': path.join(__dirname, './src/common'),
            '@components': path.join(__dirname, './src/common/components'),
            '@locales': path.join(__dirname, './src/locales'),
            '@pages': path.join(__dirname, './src/pages'),
        },
    },
    externals: {
        ['lodash']: "window['@zhst/libs'].lodash",
        ['react']: "window['@zhst/libs'].React",
        ['react-dom']: "window['@zhst/libs'].ReactDOM",
        ['react-router-dom']: "window['@zhst/libs'].ReactRouterDom",
        ['moment']: "window['@zhst/libs'].moment",
        ['@zhst/components']: "window['@zhst/libs'].zhstComponents",
        ['i18next']: "window['@zhst/libs'].i18next",
        ['react-i18next']: "window['@zhst/libs'].reactI18next",
        ['proto']: 'window.proto',
        ['@alifd/next']: "window['@zhst/libs'].fusion",
    },
};

export default newConfig;
