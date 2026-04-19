export const ENV = {
  appId: process.env.VITE_APP_ID ?? "opcs-admin",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Manus Forge API (legacy, kept for compatibility)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // 通义千问 / DashScope API
  dashscopeApiKey: process.env.ALIYUN_DASHSCOPE_API_KEY ?? "",
  dashscopeBaseUrl: process.env.ALIYUN_DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dashscopeModel: process.env.ALIYUN_DASHSCOPE_MODEL ?? "qwen-max",
  dashscopeVisionModel: process.env.ALIYUN_DASHSCOPE_VISION_MODEL ?? "qwen-vl-max",
};
