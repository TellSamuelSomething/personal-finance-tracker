import jwt from "jsonwebtoken";

/** Requires a valid `Authorization: Bearer <token>` header and sets `req.userId`. */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, req.app.locals.jwtSecret, { algorithms: ["HS256"] });
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
