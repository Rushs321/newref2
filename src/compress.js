const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, inputStream) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  // Use sharp to process the stream directly
  const transformStream = sharp()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
    });

  // Pipe the input stream into the transformStream (sharp)
  inputStream
    .pipe(transformStream)
    .on('info', (info) => {
      // Set headers based on the transformed image info
      res.setHeader('content-type', `image/${format}`);
      res.setHeader('content-length', info.size);
      res.setHeader('x-original-size', req.params.originSize);
      res.setHeader('x-bytes-saved', req.params.originSize - info.size);
      res.status(200);
    })
    .on('error', (err) => {
      // Handle errors and redirect if necessary
      redirect(req, res);
    })
    .pipe(res); // Pipe the transformed image to the response
}

module.exports = compress;
