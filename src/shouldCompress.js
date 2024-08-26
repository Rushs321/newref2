const MIN_COMPRESS_LENGTH = 512; // Adjust the minimum compress length as desired
const MIN_TRANSPARENT_COMPRESS_LENGTH = MIN_COMPRESS_LENGTH * 100;

function shouldCompress(req) {
  const { originType = '', originSize = '0', webp } = req.params;

  const originTypeLower = originType.toLowerCase();
  const originSizeNum = parseInt(originSize, 10);

  if (!originTypeLower.startsWith('image')) {
    console.log('Not an image:', originTypeLower);
    return false;
  }
  if (isNaN(originSizeNum) || originSizeNum === 0) {
    console.log('Zero size or invalid size:', originSizeNum);
    return false;
  }
  if (webp && originSizeNum < MIN_COMPRESS_LENGTH) {
    console.log('WebP image too small to compress:', originSizeNum);
    return false;
  }
  if (
    !webp &&
    (originTypeLower.endsWith('png') || originTypeLower.endsWith('gif')) &&
    originSizeNum < MIN_TRANSPARENT_COMPRESS_LENGTH
  ) {
    console.log('Transparent image too small to compress:', originSizeNum);
    return false;
  }

  console.log('Compression allowed for:', originTypeLower, originSizeNum);
  return true;
}

module.exports = shouldCompress;
