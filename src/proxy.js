const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');
const DEFAULT_QUALITY = 40;

async function proxy(req, reply) {
  // Parameter extraction and processing
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

  // Make the request to the target URL
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
  });

  // Set the reply status code based on the axios response
  reply.statusCode = axiosResponse.status;

  // If the response status code is 400 or higher, redirect and end response
  if (reply.statusCode >= 400) {
    return redirect(req, reply);  // Redirect will close the response
  }

  // Copy headers from the response to our reply
  copyHeaders(axiosResponse, reply);

  // Set headers for the response
  reply.header('content-encoding', 'identity');
  req.params.originType = axiosResponse.headers['content-type'] || '';
  req.params.originSize = axiosResponse.headers['content-length'] || '0';

  if (shouldCompress(req)) {
    // Compress the image and send it
    return compress(req, reply, axiosResponse.data);
  } else {
    // Directly pipe the response stream only if the response is not already sent
    if (!reply.sent) {
      reply.header('x-proxy-bypass', 1);
      reply.header('content-length', axiosResponse.headers['content-length'] || '0');

      // Pipe the response data to the reply's raw stream
      axiosResponse.data.pipe(reply.raw).on('error', (err) => {
        // Ensure error handling for the stream
        console.error('Stream Error:', err.message);
        if (!reply.sent) {
          reply.status(500).send('Stream Error');
        }
      });
    }
  }
}

module.exports = proxy;
