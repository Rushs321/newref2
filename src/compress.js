const sharp = require('sharp');
const redirect = require('./redirect');

async function compress(req, reply, input) {
  const format = req.params.webp ? 'webp' : 'jpeg';

  try {
    const { data: output, info } = await sharp(input)
      .grayscale(req.params.grayscale)
      .toFormat(format, {
        quality: req.params.quality,
        progressive: true,
        optimizeScans: true
      })
      .toBuffer({ resolveWithObject: true });

    if (!info || reply.sent) {
      return redirect(req, reply);
    }

    reply
      .header('content-type', `image/${format}`)
      .header('content-length', info.size)
      .header('x-original-size', req.params.originSize)
      .header('x-bytes-saved', req.params.originSize - info.size)
      .status(200)
      .send(output);

  } catch (err) {
    // Handle errors and redirect if necessary
    if (!reply.sent) {
      redirect(req, reply);
    }
  }
}

module.exports = compress;
