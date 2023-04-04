import configFactory from "./viteConfig.js";
import { createServer } from 'vite'

// 删减版，包含主要流程
export async function startServer(params) {
  // 获取config配置
  const config = await configFactory(params)
  const server = await createServer(config)
  await server.listen()
  server.printUrls()
}
