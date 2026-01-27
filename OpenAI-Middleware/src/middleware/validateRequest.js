/**
 * Supports both:
 *  - Encrypted mode: { token: string, type: string }
 *  - Raw mode: { type: string, task: { type, sub_type, user_input } }
 */
function validateRequest(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    console.log("🧩 [VALIDATE] Skipping validation for", {
      method: req.method,
      path: req.path,
    });
    return next();
  }

  const { token, type, task } = req.body || {};

  console.log("🧩 [VALIDATE] Incoming body shape", {
    method: req.method,
    path: req.path,
    hasToken: !!token,
    hasType: !!type,
    hasTask: !!task,
  });

  if (!type || typeof type !== "string") {
    console.warn("🧩 [VALIDATE] Missing or invalid 'type'", {
      method: req.method,
      path: req.path,
    });
    return res.status(400).json({
      status: false,
      message: "Field 'type' is required and must be a string.",
    });
  }

  if (token) {
    if (typeof token !== "string") {
      console.warn("🧩 [VALIDATE] Token provided but not a string");
      return res.status(400).json({
        status: false,
        message: "Field 'token' must be a string when provided.",
      });
    }
    console.log("🧩 [VALIDATE] Encrypted mode detected");
    return next();
  }

  if (!task || typeof task !== "object") {
    console.warn("🧩 [VALIDATE] Raw mode without valid task object");
    return res.status(400).json({
      status: false,
      message:
        "Raw mode requires 'task' object with { type, sub_type, user_input }.",
    });
  }

  const { type: taskType, sub_type, user_input } = task;

  if (!taskType || typeof taskType !== "string") {
    console.warn("🧩 [VALIDATE] Invalid task.type");
    return res.status(400).json({
      status: false,
      message: "Field 'task.type' is required and must be a string.",
    });
  }

  if (!sub_type || typeof sub_type !== "string") {
    console.warn("🧩 [VALIDATE] Invalid task.sub_type");
    return res.status(400).json({
      status: false,
      message: "Field 'task.sub_type' is required and must be a string.",
    });
  }

  if (
    user_input === undefined ||
    user_input === null ||
    typeof user_input !== "string" ||
    !user_input.trim()
  ) {
    console.warn("🧩 [VALIDATE] Invalid task.user_input");
    return res.status(400).json({
      status: false,
      message:
        "Field 'task.user_input' is required, must be a non-empty string.",
    });
  }

  console.log("🧩 [VALIDATE] Request body validated");

  return next();
}

module.exports = validateRequest;


