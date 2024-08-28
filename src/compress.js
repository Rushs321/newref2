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
        optimizeScans: true,
      })
      .toBuffer();

    reply
      .header('content-type', `image/${format}`)
      .header('content-length', output.length)
      .header('x-original-size', req.params.originSize)
      .header('x-bytes-saved', req.params.originSize - output.length)
      .send(output);
  } catch (err) {
    if (!reply.sent) {
      redirect(req, reply);
    }
  }
}

module.exports = compress;
