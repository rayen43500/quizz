export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: 'Resource already exists' });
  }
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}
