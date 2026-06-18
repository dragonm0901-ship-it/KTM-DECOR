export const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler Caught:", err.stack || err);
  
  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
