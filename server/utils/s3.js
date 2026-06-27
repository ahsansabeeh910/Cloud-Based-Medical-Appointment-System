const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl: awsGetSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * AWS S3 Client instance.
 * Configured from environment variables.
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a file buffer to AWS S3.
 *
 * @param {Object} file - Multer file object with buffer, originalname, mimetype
 * @param {string} folder - S3 folder/prefix (e.g. 'prescriptions', 'profiles')
 * @returns {Promise<{ key: string, url: string }>} The S3 object key and public URL
 */
const uploadToS3 = async (file, folder = 'uploads') => {
  const ext = path.extname(file.originalname);
  const key = `${folder}/${uuidv4()}${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { key, url };
};

/**
 * Generate a pre-signed URL for secure, time-limited access to an S3 object.
 *
 * @param {string} key - The S3 object key
 * @param {number} [expiresIn=3600] - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} The pre-signed URL
 */
const getSignedUrl = async (key, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  const signedUrl = await awsGetSignedUrl(s3Client, command, { expiresIn });
  return signedUrl;
};

/**
 * Delete an object from AWS S3.
 *
 * @param {string} key - The S3 object key to delete
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
};

module.exports = {
  s3Client,
  uploadToS3,
  getSignedUrl,
  deleteFromS3,
};
