import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 Credentials
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "kdpage-artbook";
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. "https://pub-xxxx.r2.dev" or custom domain "https://cdn.kdpage.com"

export function isR2Configured(): boolean {
  return Boolean(
    R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME
  );
}

function getR2Client(): S3Client | null {
  if (!isR2Configured()) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Uploads a base64 image or buffer to Cloudflare R2 and returns the public CDN URL.
 * If R2 is not configured, it returns null gracefully so the app falls back safely.
 */
export async function uploadImageToR2(
  imageSource: string,
  folder = "artbook"
): Promise<{ url: string; key: string } | null> {
  const client = getR2Client();
  if (!client) {
    return null;
  }

  try {
    let buffer: Buffer;
    let contentType = "image/png";

    if (imageSource.startsWith("data:")) {
      const matches = imageSource.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        contentType = matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(imageSource.replace(/^data:image\/\w+;base64,/, ""), "base64");
      }
    } else {
      buffer = Buffer.from(imageSource, "base64");
    }

    const ext = contentType.includes("jpeg") || contentType.includes("jpg") ? "jpg" : "png";
    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: contentType,
      })
    );

    // Formulate public CDN URL:
    // If R2_PUBLIC_URL is provided (e.g. pub-xxx.r2.dev or cdn.kdpage.com), use it.
    // Otherwise fallback to direct R2 public endpoint
    const baseUrl = R2_PUBLIC_URL?.replace(/\/$/, "") || `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
    const publicUrl = `${baseUrl}/${filename}`;

    return { url: publicUrl, key: filename };
  } catch (err) {
    console.error("Failed to upload image to Cloudflare R2:", err);
    return null;
  }
}

/**
 * Deletes an image from Cloudflare R2 given its key or public URL.
 */
export async function deleteImageFromR2(keyOrUrl: string): Promise<boolean> {
  const client = getR2Client();
  if (!client || !keyOrUrl) return false;

  try {
    // Extract key if full URL was provided
    let key = keyOrUrl;
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
      const urlObj = new URL(keyOrUrl);
      key = urlObj.pathname.replace(/^\//, "");
    }

    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (err) {
    console.error("Failed to delete image from Cloudflare R2:", err);
    return false;
  }
}
