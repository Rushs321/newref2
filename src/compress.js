const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, inputStream) {
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
  res.setHeader('content-type', `image/${format}`);

  // Pipe the input stream through sharp, handle the metadata and pipe to response
  inputStream
    .pipe(transform)
    .on('info', (info) => {
      // Set headers based on the transformed image info
      res.setHeader('content-length', info.size);
      res.setHeader('x-original-size', req.params.originSize);
      res.setHeader('x-bytes-saved', req.params.originSize - info.size);
    })
    .on('error', () => {
      // Handle transformation errors
      redirect(req, res);
    })
    .pipe(res); // Pipe the final output to the response
}

module.exports = compress;
