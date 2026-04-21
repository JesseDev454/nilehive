const DEFAULT_EVENT_TIME_ZONE = "Africa/Lagos";

function getDateStringInTimeZone(date = new Date(), timeZone = process.env.APP_TIME_ZONE || DEFAULT_EVENT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = parts.reduce((accumulator, part) => {
    accumulator[part.type] = part.value;
    return accumulator;
  }, {});

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeEventDate(value) {
  return typeof value === "string" ? value.slice(0, 10) : null;
}

function getEventLifecycle(eventDate, now = new Date()) {
  const normalizedEventDate = normalizeEventDate(eventDate);

  if (!normalizedEventDate) {
    return "upcoming";
  }

  const today = getDateStringInTimeZone(now);

  if (normalizedEventDate < today) {
    return "past";
  }

  if (normalizedEventDate === today) {
    return "happening_today";
  }

  return "upcoming";
}

function canRsvpToEvent(eventDate, now = new Date()) {
  return ["upcoming", "happening_today"].includes(getEventLifecycle(eventDate, now));
}

module.exports = {
  canRsvpToEvent,
  getEventLifecycle
};
