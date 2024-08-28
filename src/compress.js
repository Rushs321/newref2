const sharp = require('sharp');
const redirect = require('./redirect');

async function compress(req, reply, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  try {
    const output = await sharp(input)
      .grayscale(req.params.grayscale)
      .toFormat(format, {
        quality: req.params.quality,
        progressive: true,
        optimizeScans: true
      })
      .toBuffer();

    const info = await sharp(output).metadata();

    reply.header('content-type', `image/${format}`);
    reply.header('content-length', info.size);
    reply.header('x-original-size', req.params.originSize);
    reply.header('x-bytes-saved', req.params.originSize - info.size);
    reply.status(200);
    reply.send(output);
  } catch (err) {
    return redirect(req, reply);
  }
}

module.exports = compress;
