const axios = require('axios');
const pick = require('lodash').pick;
const shouldCompress = require('./shouldCompress');
const redirect = require('./redirect');
const compress = require('./compress');
const copyHeaders = require('./copyHeaders');

async function proxy(request, reply) {
  try {
    // Making the request with axios.get
    const axiosResponse = await axios.get(request.params.url, {
      headers: {
        ...pick(request.headers, ["cookie", "dnt", "referer"]),
        "user-agent": "Bandwidth-Hero Compressor",
        "x-forwarded-for": request.headers["x-forwarded-for"] || request.ip,
        via: "1.1 bandwidth-hero",
      },
      responseType: 'stream', // To handle streaming data
      timeout: 10000,
      maxRedirects: 5,
      validateStatus: (status) => status < 400, // Treats HTTP errors as rejected promises
    });

    // Handle non-2xx responses
    if (axiosResponse.status >= 400) {
      return redirect(request, reply);
    }

    // Copy headers from the response to our response
    copyHeaders(axiosResponse, reply);

    // Set headers for the response
    reply.header("content-encoding", "identity");
    request.params.originType = axiosResponse.headers["content-type"] || "";
    request.params.originSize = axiosResponse.headers["content-length"] || "0";

    if (shouldCompress(request)) {
      // Compress the image
      return compress(request, reply, axiosResponse.data);
    } else {
      // Directly pipe the response stream
      reply.header("x-proxy-bypass", 1);
      reply.header("content-length", axiosResponse.headers["content-length"] || "0");
      axiosResponse.data.pipe(reply);
    }
  } catch (error) {
    // Handle errors (e.g., network issues)
    return redirect(request, reply);
  }
}

module.exports = proxy;
