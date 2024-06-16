const { S3Client, PutObjectCommand, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const mime = require('mime-types');
require('dotenv').config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const uploadImage = async (file) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = Date.now().toString() + '-' + file.originalname;
  const contentType = mime.lookup(file.originalname) || 'application/octet-stream';

  const uploadParams = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    Metadata: { fieldName: file.fieldname },
    ContentDisposition: 'inline',
    ACL: 'public-read'
  };

  try {
    // Upload the image
    const uploadCommand = new PutObjectCommand(uploadParams);
    await s3.send(uploadCommand);

    // Update the Content-Type
    const updateParams = {
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      Key: key,
      ContentType: contentType,
      MetadataDirective: 'REPLACE'
    };
    const copyCommand = new CopyObjectCommand(updateParams);
    await s3.send(copyCommand);

    return { Location: `https://${bucketName}.s3.amazonaws.com/${key}`, Key: key };
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    throw error;
  }
};

const deleteImage = async (key) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
  } catch (error) {
    console.error('Error deleting image from S3:', error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };
