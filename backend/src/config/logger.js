function writeLog(level, message, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields
  };

  const serialized = JSON.stringify(entry);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

function child(baseFields = {}) {
  return {
    child(extraFields = {}) {
      return child({ ...baseFields, ...extraFields });
    },
    debug(message, fields = {}) {
      writeLog("debug", message, { ...baseFields, ...fields });
    },
    info(message, fields = {}) {
      writeLog("info", message, { ...baseFields, ...fields });
    },
    warn(message, fields = {}) {
      writeLog("warn", message, { ...baseFields, ...fields });
    },
    error(message, fields = {}) {
      writeLog("error", message, { ...baseFields, ...fields });
    }
  };
}

const logger = child();

module.exports = {
  child,
  logger
};
