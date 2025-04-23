const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload-middleware');
const { uploadImage } = require('../functions/s3-utils');
const Image = require('../models/images.model'); 
const mime = require('mime-types');


router.post('/upload/:id', upload.single('image'), async (req, res) => {
  // Revert to original logic
  console.log("Image ID from URL parameter:", req.params.id);
  console.log("File:", req.file);
  uploadImage(req.file)
    .then(async result => {
      const newImage = new Image({
        ImageID: req.params.id,
        link: result.Location,
        order: req.query.order
      });

      await newImage.save()
        .then(() => {
          console.log('Image saved:', result.Location);
          res.status(200).json({ imageUrl: result.Location });
        })
        .catch(err => {
          console.error('Error saving image:', err);
          res.status(400).json('Error: ' + err);
        });
    })
    .catch(error => {
      console.error('Error uploading image to S3:', error);
      res.status(500).send(error);
    });
});


router.route('/getRestaurantImages/:id').get(async (req, res) => {
  const restaurantId = req.params.id;
  console.log(restaurantId)
  try {
    const images = await Image.find({ ImageID: restaurantId });
    console.log(images)
    res.json(images);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});



router.route('/addRestaurantImages/:id').post(async (req, res) => {
  const restaurantId = req.params.id;
  const images = req.body;

  try {
    // Save the new images
    for (const image of images) {
      const newImage = new Image({
        ImageID: restaurantId,
        link: image.url,
        order: image.order
      });
      await newImage.save();
    }

    res.status(200).json('Images updated successfully');
  } catch (err) {
    console.error('Error updating images:', err);
    res.status(500).json('Error: ' + err);
  }
});

router.route('/uploadIfNotExists/:id').post(upload.single('image'), async (req, res) => {
  console.log("Image ID from URL parameter:", req.params.id);
  if (!req.file) {
    if (req.body.imageUrl) {
      // Handle the case where only an image URL is provided
      try {
        const newImage = new Image({
          ImageID: req.params.id,
          link: req.body.imageUrl,
          test: 'test'
        });
        await newImage.save();
        console.log('Image link saved:', req.body.imageUrl);
        res.status(200).json({ imageUrl: req.body.imageUrl });
      } catch (err) {
        console.error('Error:', err);
        res.status(500).json('Error: ' + err);
      }
    } else {
      return res.status(400).json({ error: 'No file uploaded or image URL provided' });
    }
  } else {
    console.log("Uploaded file:", req.file);
    console.log("Original filename:", req.file.originalname);

    const fileName = `${Date.now().toString()}-${uuidv4()}`;

    const checkIfImageExists = async (key) => {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };
      try {
        await s3.headObject(params).promise();
        return true;
      } catch (err) {
        if (err.code === 'NotFound') {
          return false;
        }
        throw err;
      }
    };

    try {
      const imageExists = await checkIfImageExists(fileName);
      if (imageExists) {
        const imageLink = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        const newImage = new Image({
          ImageID: req.params.id,
          link: imageLink,
          test: 'test'
        });
        await newImage.save();
        console.log('Image link saved:', imageLink);
        res.status(200).json({ imageUrl: imageLink });
      } else {
        const result = await uploadImage(req.file);
        const newImage = new Image({
          ImageID: req.params.id,
          link: result.Location,
          test: 'test'
        });
        await newImage.save();
        console.log('Image saved:', result.Location);
        res.status(200).json({ imageUrl: result.Location });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Error: ' + error);
    }
  }
});


module.exports = router;