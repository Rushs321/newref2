const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const DEFAULT_QUALITY = 40;

async function proxy(req, reply) {
  // Parameter extraction and processing (formerly in params.js)
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

  // Main proxy logic
  
    const axiosResponse = await axios.get(req.params.url, {
      headers: {
        ...pick(req.headers, ['cookie', 'dnt', 'referer']),
        'user-agent': 'Bandwidth-Hero Compressor',
        'x-forwarded-for': req.headers['x-forwarded-for'] || req.ip,
        via: '1.1 bandwidth-hero',
      },
      responseType: 'stream',
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    if (axiosResponse.status >= 400) {
      return redirect(req, reply);
    }

    // Copy headers from the response to our reply
    copyHeaders(axiosResponse, reply);

    reply.header('content-encoding', 'identity');
    req.params.originType = axiosResponse.headers['content-type'] || '';
    req.params.originSize = axiosResponse.headers['content-length'] || '0';

    if (shouldCompress(req)) {
      return compress(req, reply, axiosResponse.data);
    } else {
      reply.header('x-proxy-bypass', 1);
      reply.header('content-length', axiosResponse.headers['content-length'] || '0');
      axiosResponse.data.pipe(reply.raw);
    }
  
}

module.exports = proxy;
