const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload-middleware');
const { uploadImage } = require('../functions/s3-utils');
const Image = require('../models/images.model'); 


router.route('/upload/:id').post(upload.single('image'), (req, res) => {
  console.log("Image ID from URL parameter:", req.params.id);
  uploadImage(req.file)
    .then(async result => {
      const newImage = new Image({
        ImageID: req.params.id,
        link: result.Location
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

module.exports = router;