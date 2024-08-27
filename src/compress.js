const sharp = require('sharp');
const redirect = require('./redirect');

function compress(request, reply, inputStream) {
  const format = request.params.webp ? 'webp' : 'jpeg';

  // Create a sharp transformation stream
  const transform = sharp()
    .grayscale(request.params.grayscale)
    .toFormat(format, {
      quality: request.params.quality,
      progressive: true,
      optimizeScans: true
    });

  // Set the initial headers for the response
  reply.header('content-type', `image/${format}`);

  // Pipe the input stream through sharp, handle the metadata and pipe to response
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
      redirect(request, reply);
    })
    .pipe(reply); // Pipe the final output to the response
}

module.exports = compress;
