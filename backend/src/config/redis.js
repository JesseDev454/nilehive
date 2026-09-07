const IORedis = require("ioredis");
const { getEnv } = require("./env");

let sharedRedis;

function createRedisConnection() {
  const env = getEnv();

  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }

  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  });
}

function getSharedRedisConnection() {
  if (!sharedRedis) {
    sharedRedis = createRedisConnection();
  }

  return sharedRedis;
}

async function pingRedis(connection = null) {
  const client = connection ?? getSharedRedisConnection();
  const result = await client.ping();

  return result === "PONG";
}

async function closeSharedRedisConnection() {
  if (!sharedRedis) {
    return;
  }

  const client = sharedRedis;
  sharedRedis = null;
  await client.quit().catch(() => client.disconnect());
}

module.exports = {
  closeSharedRedisConnection,
  createRedisConnection,
  getSharedRedisConnection,
  pingRedis
};
