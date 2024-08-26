const fetch = require('node-fetch');
const pick = require('lodash/pick');
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  const url = req.params.url;
  const headers = {
    ...pick(req.headers, ["cookie", "dnt", "referer"]),
    "user-agent": "Bandwidth-Hero Compressor",
    "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
    via: "1.1 bandwidth-hero",
  };

  try {
    const origin = await fetch(url, {
      method: 'GET',
      headers: headers,
      redirect: 'follow',
      compress: true,
    });

    if (!origin.ok) {
      redirect(req, res);
      return;
    }

    copyHeaders(origin.headers.raw(), res);
    res.setHeader("content-encoding", "identity");
    req.params.originType = origin.headers.get("content-type") || "";
    req.params.originSize = origin.headers.get("content-length") || "0";

    if (shouldCompress(req)) {
      return compress(req, res, origin.body); // Pass the stream directly
    } else {
      res.setHeader("x-proxy-bypass", 1);
      res.setHeader("content-length", origin.headers.get("content-length") || "0");
      origin.body.pipe(res); // Stream directly to client
    }
  } catch (error) {
    redirect(req, res);
  }
}

module.exports = proxy;
