const { request } = require('undici');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  try {
    // Perform the HTTP request using undici.request
    const { statusCode, headers, body } = await request(req.params.url, {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      timeout: 10000,
      maxRedirects: 5,
      method: 'GET',
      compress: true, // Enable gzip/deflate compression
    });

    // Check for HTTP error responses
    if (statusCode >= 400) {
      redirect(req, res);
      return;
    }

    // Copy headers and handle compression or streaming
    copyHeaders(headers, res);
    res.setHeader("content-encoding", "identity");
    req.params.originType = headers["content-type"] || "";
    req.params.originSize = headers["content-length"] || "0";

    if (shouldCompress(req)) {
      // Handle image compression with sharp
      compress(req, res, body);
    } else {
      // Handle non-compressed response by piping directly to the client
      res.setHeader("x-proxy-bypass", 1);
      res.setHeader("content-length", headers["content-length"] || "0");
      body.pipe(res);
    }
  } catch (error) {
    // Handle any errors that occur during the request
    redirect(req, res);
  }
}

module.exports = proxy;
