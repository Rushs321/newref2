const sharp = require('sharp');
const redirect = require('./redirect');

const DEFAULT_QUALITY = 40;

async function compress(request, reply, inputStream) {
  const format = request.params.webp ? 'webp' : 'jpeg';

  // Create a sharp transformation stream
  const transform = sharp()
    .grayscale(request.params.grayscale)
    .toFormat(format, {
      quality: request.params.quality || DEFAULT_QUALITY,
      progressive: true,
      optimizeScans: true,
    });

  // Set the initial headers for the response
  reply.header('content-type', `image/${format}`);

  // Handle the transformation stream and pipe it to the response
  try {
    const pipeline = inputStream.pipe(transform);
    
    // Handle 'info' event to set dynamic headers
    pipeline.on('info', (info) => {
      if (!reply.sent) {
        reply.header('content-length', info.size);
        reply.header('x-original-size', request.params.originSize);
        reply.header('x-bytes-saved', request.params.originSize - info.size);
      }
    });

    // Pipe the transformed stream to the response
    pipeline.pipe(reply.raw);
  } catch (error) {
    // Handle transformation errors
    if (!reply.sent) {
      redirect(request, reply);
    }
  }
}

module.exports = compress;
