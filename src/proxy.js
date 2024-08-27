const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

async function proxy(req, reply) {
  try {
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
  } catch (error) {
    return redirect(req, reply);
  }
}

module.exports = proxy;
