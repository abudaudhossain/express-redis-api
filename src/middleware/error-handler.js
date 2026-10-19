
export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const candidateStatus = error.statusCode;

  const statusCode =
    Number.isInteger(candidateStatus) &&
    candidateStatus >= 400 &&
    candidateStatus <= 599
      ? candidateStatus
      : 500;

  const isOperational = error.isOperational === true;

  console.error("Request failed:", {
    method: req.method,
    path: req.originalUrl,
    message: error.message,
    statusCode,
    stack: error.stack,
  });

  const message =
    statusCode === 500 && !isOperational
      ? "Internal server error"
      : error.message || "Request failed";

  return res.status(statusCode).json({
    success: false,
    message,
  });
}
