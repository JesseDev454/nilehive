const { createApp } = require("./app");
const { db } = require("./config/db");
const { getEnv } = require("./config/env");

const { HOST, PORT } = getEnv();
const app = createApp({ database: db });

app.listen(PORT, HOST, () => {
  console.log(`NileHive backend listening on http://${HOST}:${PORT}`);
});
