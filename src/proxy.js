const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

const DEFAULT_QUALITY = 40;

async function proxy(req, res) {
  const { url, jpeg, bw, l } = req.query;

  if (!url) {
    return res.send('bandwidth-hero-proxy');
  }

  const urls = Array.isArray(url) ? url.join('&url=') : url;
  const cleanedUrl = urls.replace(/http:\/\/1\.1\.\d\.\d\/bmi\/(https?:\/\/)?/i, 'http://');

  req.params = {
    url: cleanedUrl,
    webp: !jpeg,
    grayscale: bw !== '0',
    quality: parseInt(l, 10) || DEFAULT_QUALITY,
  };

  try {
    const axiosResponse = await axios.get(req.params.url, {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      responseType: 'stream',
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400,
    });

    if (!axiosResponse.ok) {
        return redirect(req, res);
        }

    copyHeaders(axiosResponse, res);

    res.header("content-encoding", "identity");
    req.params.originType = axiosResponse.headers["content-type"] || "";
    req.params.originSize = axiosResponse.headers["content-length"] || "0";

    if (shouldCompress(req)) {
      return compress(req, res, axiosResponse.data);
    } else {
      res.header("x-proxy-bypass", 1);
      res.header("content-length", axiosResponse.headers["content-length"] || "0");
      axiosResponse.data.pipe(res.raw); // Use res.raw to pipe the stream directly
    }
  } catch (error) {
    return redirect(req, res);
  }
}

module.exports = proxy;
