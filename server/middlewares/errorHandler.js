export function notFound(req, res) {
  res.status(404).json({ message: "Not found" });
}

// Express 5 forwards errors thrown in async handlers here, so controllers do not need try/catch.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body is not valid JSON" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large" });
  }

  // The details stay in the server log, the client only gets a generic message.
  console.error(err);
  res.status(500).json({ message: "Server error" });
}
