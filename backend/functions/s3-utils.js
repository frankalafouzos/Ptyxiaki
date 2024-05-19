const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const uploadImage = async (file) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: file.buffer,
    Metadata: { fieldName: file.fieldname }
  };

  try {
    const command = new PutObjectCommand(params);
    const data = await s3.send(command);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = { uploadImage };
