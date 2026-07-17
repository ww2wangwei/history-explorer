/**
 * 天地图 JS API 全局类型
 * 官方无 @types/tianditu，简化为 any
 */
export {}

declare global {
  interface Window {
    T: any
  }
}
