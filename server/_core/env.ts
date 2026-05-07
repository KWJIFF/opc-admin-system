export const ENV = {
  appId: process.env.VITE_APP_ID ?? "opcs-admin",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // --- Manus OAuth（可选，自托管时留空即自动走本地登录） ---
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",

  // --- Manus Forge API（可选，自托管时留空即自动走千问） ---
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // --- 通义千问 / DashScope API（自托管首选） ---
  dashscopeApiKey: process.env.ALIYUN_DASHSCOPE_API_KEY ?? "",
  dashscopeBaseUrl: process.env.ALIYUN_DASHSCOPE_BASE_URL ?? "https://dashscope.aliyuncs.com/compatible-mode/v1",
  dashscopeModel: process.env.ALIYUN_DASHSCOPE_MODEL ?? "qwen-max",
  dashscopeVisionModel: process.env.ALIYUN_DASHSCOPE_VISION_MODEL ?? "qwen-vl-max",
};

/** 是否处于 Manus 平台模式（OAuth 已配置） */
export const isManusMode = () => Boolean(ENV.oAuthServerUrl && ENV.oAuthServerUrl.length > 0);

/** 是否处于自托管模式（无 Manus OAuth） */
export const isSelfHostedMode = () => !isManusMode();
