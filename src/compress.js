const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, inputStream) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  const transform = sharp()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true,
    });

  res.header('content-type', `image/${format}`);

  inputStream
    .pipe(transform)
    .on('info', (info) => {
      res.header('content-length', info.size);
      res.header('x-original-size', req.params.originSize);
      res.header('x-bytes-saved', req.params.originSize - info.size);
    })
    .on('error', () => {
      redirect(req, res);
    })
    .pipe(res.raw); // Use res.raw to pipe the stream directly
}

module.exports = compress;
