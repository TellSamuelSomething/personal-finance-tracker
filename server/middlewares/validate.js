/** Validates and cleans `req.body` with a zod schema, answering 400 with one message per field. */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      const errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "body";
        errors[field] ??= issue.message;
      }
      return res.status(400).json({ message: "Invalid input", errors });
    }

    req.body = result.data;
    next();
  };
}
