const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

async function proxy(req, res) {
  try {
    // Making the request with axios.get
    const axiosResponse = await axios.get(req.params.url, {
      headers: {
        ...pick(req.headers, ["cookie", "dnt", "referer"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": req.headers["x-forwarded-for"] || req.ip,
        via: "1.1 bandwidth-hero",
      },
      responseType: 'stream', // To handle streaming data
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Treats HTTP errors as rejected promises
    });

    // Handle non-2xx responses
    if (axiosResponse.status >= 400) {
      return redirect(req, res);
    }

    // Copy headers from the response to our response
    copyHeaders(axiosResponse, res);

    // Set headers for the response
    res.setHeader("content-encoding", "identity");
    req.params.originType = axiosResponse.headers["content-type"] || "";
    req.params.originSize = axiosResponse.headers["content-length"] || "0";

    if (shouldCompress(req)) {
      // Compress the image
      return compress(req, res, axiosResponse.data);
    } else {
      // Directly pipe the response stream
      res.setHeader("x-proxy-bypass", 1);
      res.setHeader("content-length", axiosResponse.headers["content-length"] || "0");
      axiosResponse.data.pipe(res);
    }
  } catch (error) {
    // Handle errors (e.g., network issues)
    return redirect(req, res);
  }
}

module.exports = proxy;
