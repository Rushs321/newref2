const DEFAULT_QUALITY = 40;

async function params(request, reply) {
  const { url, jpeg, bw, l } = request.query;

  if (!url) {
    return reply.send('bandwidth-hero-proxy');
  }

  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  request.params.url = cleanedUrl;
  request.params.webp = !jpeg;
  request.params.grayscale = bw !== '0';
  request.params.quality = parseInt(l, 10) || DEFAULT_QUALITY;
}

module.exports = params;
