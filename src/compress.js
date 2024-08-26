const sharp = require('sharp');
const redirect = require('./redirect');

async function compress(req, res) {
  const format = req.query.webp ? 'webp' : 'jpeg';
  
  try {
    const inputStream = req.raw; // Fastify request object
    const transform = sharp()
      .grayscale(req.query.grayscale)
      .toFormat(format, {
        quality: req.query.quality,
        progressive: true,
        optimizeScans: true
      });

    // Pipe the input stream through sharp
    const { data: outputStream, info } = await new Promise((resolve, reject) => {
      inputStream
        .pipe(transform)
        .toBuffer((err, output, info) => {
          if (err) {
            reject(err);
          } else {
            resolve({ data: output, info });
          }
        });
    });

    // Set response headers and send the output
    res.header('content-type', `image/${format}`);
    res.header('content-length', info.size);
    res.header('x-original-size', req.query.originSize);
    res.header('x-bytes-saved', req.query.originSize - info.size);
    res.code(200);
    res.send(outputStream);
  } catch (error) {
    redirect(req, res);
  }
}

module.exports = compress;
