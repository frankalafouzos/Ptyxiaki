// const AWS = require('aws-sdk');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// const Image = require('./models/images.model'); // Adjust the path as necessary
// const Restaurant = require('./models/restaurant.model'); // Adjust the path as necessary

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION
// });

// const s3 = new AWS.S3();

// const uri = process.env.ATLAS_URI;
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;

// connection.once('open', () => {
//   console.log("MongoDB database connection established successfully");

//   // Function to upload a file to S3
//   const uploadToS3 = (filePath, fileName) => {
//     const fileContent = fs.readFileSync(filePath);

//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: `${Date.now()}-${fileName}`,
//       Body: fileContent
//     };

//     return s3.upload(params).promise();
//   };

//   // Function to upload all images from the local folder to S3
//   const uploadAllImages = async (folderPath) => {
//     const uploadedLinks = new Map();

//     const files = fs.readdirSync(folderPath);

//     for (const file of files) {
//       const filePath = path.join(folderPath, file);

//       if (fs.statSync(filePath).isFile()) {
//         const fileName = path.basename(filePath);
//         const result = await uploadToS3(filePath, fileName);
//         uploadedLinks.set(fileName, result.Location);

//         console.log(`Uploaded ${fileName} to S3: ${result.Location}`);
//       }
//     }

//     return uploadedLinks;
//   };

//   // Function to update image links in the database
//   const updateImageLinks = async (uploadedLinks) => {
//     try {
//       // Fetch all images
//       const images = await Image.find();

//       for (const image of images) {
//         const fileName = path.basename(image.link);

//         if (uploadedLinks.has(fileName)) {
//           const newLink = uploadedLinks.get(fileName);

//           // Update the image document in the database
//           image.link = newLink;
//           await image.save();

//           console.log(`Updated image ${image._id} with new link ${newLink}`);
//         }
//       }
//     } catch (error) {
//       console.error('Error updating image links:', error);
//     } finally {
//       mongoose.connection.close();
//     }
//   };

//   const folderPath = path.join('C:', 'Users', 'e-mashine', 'Documents', 'Personal', 'GitHub', 'Ptyxiaki', 'frontend', 'src', 'imgs');
//   uploadAllImages(folderPath)
//     .then(uploadedLinks => updateImageLinks(uploadedLinks))
//     .catch(error => console.error('Error uploading images:', error));
// });


const AWS = require('aws-sdk');
require('dotenv').config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

const updateContentType = async () => {
  try {
    const bucketName = process.env.AWS_BUCKET_NAME;

    // Function to list all objects in the bucket
    const listObjects = async (continuationToken) => {
      const params = {
        Bucket: bucketName,
        ContinuationToken: continuationToken
      };
      return s3.listObjectsV2(params).promise();
    };

    // Function to update Content-Type of S3 objects
    const updateObjectContentType = async (key) => {
      const params = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${key}`,
        Key: key,
        ContentType: 'image/avif',
        MetadataDirective: 'REPLACE'
      };
      return s3.copyObject(params).promise();
    };

    let continuationToken;
    do {
      // List objects in the bucket
      const response = await listObjects(continuationToken);
      const objects = response.Contents;

      // Update each object's Content-Type
      for (const object of objects) {
        const key = object.Key;
        await updateObjectContentType(key);
        console.log(`Updated Content-Type for ${key} to image/avif`);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

  } catch (error) {
    console.error('Error updating Content-Type:', error);
  }
};

updateContentType();
