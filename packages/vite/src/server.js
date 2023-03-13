import chalk from "@lf/utils";
import configFactory from "./viteConfig.js";
// const webpackConfig = configFactory("dev");
// const compiler = webpack(webpackConfig);

// 删减版，包含主要流程
export async function createServer() {
  // 获取config配置
  const config = await configFactory()
  // 获取项目根路径
  const root = config.root
  // 获取本地服务器相关的配置
  const serverConfig = config.server
  // 创建中间件实例
  const middlewares = connect()
  // 创建 http 服务器
  const httpServer = await resolveHttpServer(
      serverConfig,
      middlewares,
      httpsOptions
  )
  // 创建 WebSocket 服务器
  const ws = createWebSocketServer(httpServer, config, httpsOptions)
  // ignored：忽略监听的文件；watchOptions：对应 server.watch 配置，传递给 chokidar 的文件系统监视器选项
  const { ignored = [], ...watchOptions } = serverConfig.watch || {}
  // 通过 chokidar 监听文件
  const watcher = chokidar.watch(path.resolve(root), {
      ignored: [
          '**/node_modules/**',
          '**/.git/**',
          ...(Array.isArray(ignored) ? ignored : [ignored]),
      ],
      ignoreInitial: true,
      ignorePermissionErrors: true,
      disableGlobbing: true,
      ...watchOptions,
  })
  // 获取 所有插件
  const plugins = config.plugins
  // 创建插件容器，是一个对象，对象的属性是 vite 支持的 rollup 的钩子函数，后面会介绍
  // 比如 options、resolveId、load、transform
  const container = await createPluginContainer(config, watcher)
  // 创建Vite 的 ModuleGraph 实例，后面也会介绍
  const moduleGraph = new ModuleGraph(container)
  // 声明 server 对象
  const server = {
      config, // 包含命令行传入的配置 和 配置文件的配置
      middlewares,
      get app() {
          return middlewares
      },
      httpServer, // http 服务器
      watcher, // 通过 chokidar 监听文件
      pluginContainer: container, // vite 支持的 rollup 的钩子函数
      ws, // WebSocket 服务器
      moduleGraph, // ModuleGraph 实例
      transformWithEsbuild,
      transformRequest(url, options) {},
      listen(port, isRestart) {},
      _optimizeDepsMetadata: null,
      _isRunningOptimizer: false,
      _registerMissingImport: null,
      _pendingReload: null,
      _pendingRequests: Object.create(null),
  }
  // 被监听文件发生变化时触发
  watcher.on('change', async (file) => {})
  // 添加文件时触发
  watcher.on('add', (file) => {})
  watcher.on('unlink', (file) => {})
  // 执行插件中的 configureServer 钩子函数
  // configureServer：https://vitejs.cn/guide/api-plugin.html#configureserver
  const postHooks = []
  for (const plugin of plugins) {
      if (plugin.configureServer) {
          // configureServer 可以注册前置中间件，就是在内部中间件之前执行；也可以注册后置中间件
          // 如果configureServer 返回一个函数，这个函数内部就是注册后置中间件，并将这些函数收集到 postHooks 中
          postHooks.push(await plugin.configureServer(server))
      }
  }
  // 接下来就是注册中间件
  // base
  if (config.base !== '/') {
      middlewares.use(baseMiddleware(server))
  }
  // ...
  // 主要转换中间件
  middlewares.use(transformMiddleware(server))
  // ...
    // 如果请求路径是 /结尾，则将路径修改为 /index.html
  if (!middlewareMode || middlewareMode === 'html') {
      middlewares.use(spaFallbackMiddleware(root))
  }
  // 调用用户定义的后置中间件
  postHooks.forEach((fn) => fn && fn())

  if (!middlewareMode || middlewareMode === 'html') {
      // 如果请求的url是 html 则调用插件中所有的 transformIndexHtml 钩子函数，转换html，并将转换后的 html 代码发送给客户端
      middlewares.use(indexHtmlMiddleware(server))
      // handle 404s
      middlewares.use(function vite404Middleware(_, res) {
          res.statusCode = 404
          res.end()
      })
  }
  if (!middlewareMode && httpServer) {
      // 重写 httpServer.listen，在服务器启动前预构建
      const listen = httpServer.listen.bind(httpServer)
      httpServer.listen = async (port, ...args) => {}
  } else {}
  return server
}
