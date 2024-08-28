const sharp = require('sharp');
const redirect = require('./redirect');

async function compress(req, reply, inputStream) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  // Create a sharp transformation stream
  const transform = sharp()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true
    });

  // Set the initial headers for the response
  reply.header('content-type', `image/${format}`);

  // Pipe the input stream through sharp, handle the metadata, and pipe to reply
  inputStream
    .pipe(transform)
    .on('info', (info) => {
      // Set headers based on the transformed image info
      reply.header('content-length', info.size);
      reply.header('x-original-size', req.params.originSize);
      reply.header('x-bytes-saved', req.params.originSize - info.size);
    })
    .on('error', () => {
      // Handle transformation errors
      if (!reply.sent) {
        redirect(req, reply);
      }
    })
    .pipe(reply.raw); // Pipe the final output to the response
}

module.exports = compress;
