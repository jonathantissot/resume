# image-service

AWS Lambda function — generates thumbnails from S3-uploaded images using sharp.

## Architecture
This is a Lambda function, NOT a long-running NestJS service. It is deployed as
a serverless function triggered by S3 `ObjectCreated` events.

## Trigger
- S3 bucket: `blog-content-{region}`
- Prefix filter: `uploads/*`
- Event type: `s3:ObjectCreated:*`

## What it does
1. Receives S3 event notification
2. Downloads the original image from `uploads/` prefix
3. Generates 2 thumbnail sizes via sharp (400px and 800px wide)
4. Uploads thumbnails back to same bucket under `thumbnails/<suffix>/`
5. Outputs are JPEG format (quality 85, progressive encoding)

## Environment Variables
| Variable | Description |
|----------|-------------|
| `AWS_REGION` | AWS region (set automatically by Lambda runtime) |

## Output Key Pattern
```
uploads/my-post/cover.png
  → thumbnails/thumb-400/cover.jpg
  → thumbnails/thumb-800/cover.jpg
```

## Building & Packaging
```bash
npm install
npm run build          # compiles TypeScript → dist/
npm run package        # zips dist/ + node_modules into function.zip
```

## Downstream Dependencies
- AWS S3 (read original + write thumbnails)
- sharp (native binary — must use Lambda layer or arm64 build)
