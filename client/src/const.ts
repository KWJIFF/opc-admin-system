export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// 始终使用本地登录页面（独立认证系统）
export const getLoginUrl = (returnPath?: string) => {
  return returnPath ? `/login?return=${encodeURIComponent(returnPath)}` : '/login';
};
