const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload-middleware');
const { uploadImage } = require('../functions/s3-utils');

router.route('/upload').post(upload.single('image'), (req, res) => {
  uploadImage(req.file)
    .then(result => {
      res.send({ imageUrl: result.Location });
    })
    .catch(error => {
      res.status(500).send(error);
    });
});

module.exports = router;