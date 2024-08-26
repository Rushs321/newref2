const sharp = require('sharp');

async function compress(request, reply) {
  const format = request.params.webp ? 'webp' : 'jpeg';

  try {
    // Assuming `input` is a readable stream from request body
    const inputStream = request.raw; // Accessing raw Node.js request

    const outputBuffer = await sharp(inputStream)
      .grayscale(request.params.grayscale)
      .toFormat(format, {
        quality: parseInt(request.params.quality),
        progressive: true,
        optimizeScans: true
      })
      .toBuffer();

    const info = await sharp(outputBuffer).metadata();

    reply
      .header('Content-Type', `image/${format}`)
      .header('Content-Length', outputBuffer.length)
      .header('X-Original-Size', request.params.originSize)
      .header('X-Bytes-Saved', request.params.originSize - outputBuffer.length)
      .code(200)
      .send(outputBuffer);
  } catch (err) {
    reply
      .code(500)
      .send(err);
  }
}

module.exports = compress;
