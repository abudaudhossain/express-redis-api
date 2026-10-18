export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error("Request failed:", {
    method: req.method,
    path: req.path,
    message: error.message,
  });

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}