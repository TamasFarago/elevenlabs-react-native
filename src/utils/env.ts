type EnvConfig = {
  agentId?: string;
  tokenFetchUrl?: string;
  userId?: string;
};

const env: EnvConfig = {
  agentId: process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID,
  tokenFetchUrl: process.env.EXPO_PUBLIC_ELEVENLABS_TOKEN_URL,
  userId: process.env.EXPO_PUBLIC_DEMO_USER_ID,
};

export const getAgentId = (overrideId?: string) => overrideId || env.agentId;

export const getTokenFetchUrl = (overrideUrl?: string) =>
  overrideUrl || env.tokenFetchUrl;

export const getDemoUserId = (overrideId?: string) => overrideId || env.userId;

export const isVoiceAgentConfigured = () => Boolean(env.agentId);

export default env;
