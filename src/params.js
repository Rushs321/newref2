const DEFAULT_QUALITY = 40;

function params(req, reply, done) {
  const { url, jpeg, bw, l } = req.query;

  if (!url) {
    return reply.send('bandwidth-hero-proxy');
  }

  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  req.params.url = cleanedUrl;
  req.params.webp = !jpeg;
  req.params.grayscale = bw !== '0';
  req.params.quality = parseInt(l, 10) || DEFAULT_QUALITY;

  done();
}

module.exports = params;
