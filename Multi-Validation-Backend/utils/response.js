const isDev = process.env.NODE_ENV === 'development';

function success(res, data, message = 'OK', status = 200, extra) {
  return res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(extra || {}),
  });
}

function error(res, message = 'Request failed', status = 400, errors, err, extra) {
  return res.status(status).json({
    success: false,
    message,
    ...(errors !== undefined ? { errors } : {}),
    ...(isDev && err ? { error: typeof err === 'string' ? err : err.message } : {}),
    ...(extra || {}),
  });
}

module.exports = { success, error };


