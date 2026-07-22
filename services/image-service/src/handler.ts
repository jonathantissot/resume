import { S3Event, S3Handler } from 'aws-lambda';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'us-east-1' });

/**
 * Thumbnail sizes to generate for each uploaded image.
 * Width values in pixels; height is auto-proportional.
 */
const THUMBNAIL_SIZES = [
  { width: 400, suffix: 'thumb-400' },
  { width: 800, suffix: 'thumb-800' },
];

/**
 * S3 trigger handler — fired whenever a new image is uploaded to the
 * source bucket under the `uploads/` prefix.
 *
 * Output thumbnails are written to the same bucket under `thumbnails/<suffix>/<key>`.
 */
export const handler: S3Handler = async (event: S3Event) => {
  const results: Array<{ key: string; status: string }> = [];

  for (const record of event.Records) {
    const sourceBucket = record.s3.bucket.name;
    const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Only process images in the uploads/ prefix
    if (!sourceKey.startsWith('uploads/')) {
      console.log(`Skipping non-upload key: ${sourceKey}`);
      continue;
    }

    try {
      // Fetch original image from S3
      const getCmd = new GetObjectCommand({ Bucket: sourceBucket, Key: sourceKey });
      const response = await s3.send(getCmd);
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }
      const imageBuffer = Buffer.concat(chunks);

      const filenameParts = sourceKey.split('/');
      const filename = filenameParts[filenameParts.length - 1];

      // Generate thumbnails for each configured size
      for (const size of THUMBNAIL_SIZES) {
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize({ width: size.width, withoutEnlargement: true })
          .jpeg({ quality: 85, progressive: true })
          .toBuffer();

        const destKey = `thumbnails/${size.suffix}/${filename.replace(/\.[^.]+$/, '.jpg')}`;
        await s3.send(new PutObjectCommand({
          Bucket: sourceBucket,
          Key: destKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
          CacheControl: 'public, max-age=31536000',
        }));

        console.log(`Generated thumbnail: ${destKey}`);
        results.push({ key: destKey, status: 'success' });
      }
    } catch (err) {
      console.error(`Failed to process ${sourceKey}:`, err);
      results.push({ key: sourceKey, status: 'error' });
    }
  }

  console.log('Processing complete', JSON.stringify(results));
};
