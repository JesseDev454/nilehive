const { createApp } = require("./app");
const { db } = require("./config/db");
const { getEnv } = require("./config/env");

const { PORT } = getEnv();
const app = createApp({ database: db });

app.listen(PORT, () => {
  console.log(`NileHive backend listening on port ${PORT}`);
});

