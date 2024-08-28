function redirect(req, res) {
  if (res.headersSent) {
    return;
  }

  res.header('content-length', 0);
  res.removeHeader('cache-control');
  res.removeHeader('expires');
  res.removeHeader('date');
  res.removeHeader('etag');
  res.header('location', encodeURI(req.params.url));
  res.status(302).send();
}

module.exports = redirect;
