const sharp = require('sharp');
const redirect = require('./redirect');

function compress(req, res, inputStream) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  // Process the image stream with sharp
  const transform = sharp()
    .grayscale(req.params.grayscale)
    .toFormat(format, {
      quality: req.params.quality,
      progressive: true,
      optimizeScans: true
    });

  // Pipe the input stream through sharp and then to the response
  inputStream
    .pipe(transform)
    .toBuffer((err, output, info) => {
      if (err || !info || res.headersSent) return redirect(req, res);

      res.setHeader('content-type', `image/${format}`);
      res.setHeader('content-length', info.size);
      res.setHeader('x-original-size', req.params.originSize);
      res.setHeader('x-bytes-saved', req.params.originSize - info.size);
      res.status(200);
      res.end(output);
    });
}

module.exports = compress;
