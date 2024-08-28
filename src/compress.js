const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, reply, inputStream) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  // Create a sharp transformation stream
  const transform = sharp()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true
    });

  let isHeadersSet = false;

  // Handle the transform stream's info event to set headers
  transform.on('info', (info) => {
    if (!isHeadersSet) {
      reply
        .header('content-type', `image/${format}`)
        .header('content-length', info.size)
        .header('x-original-size', req.params.originSize)
        .header('x-bytes-saved', req.params.originSize - info.size);
      isHeadersSet = true;
    }
  });

  // Handle errors from the sharp transformation
  transform.on('error', (err) => {
    if (!reply.sent) {
      redirect(req, reply);
    }
  });

  // Pipe the input stream through sharp and then to the response
  inputStream
    .pipe(transform)
    .pipe(reply.raw);
}

module.exports = compress;
