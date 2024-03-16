const mongoose = require('mongoose');
const fs = require('fs');


// Define a schema for the image model
const picturesSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String
});

// Create a model based on the schema
const Picture = mongoose.model('Pictures', picturesSchema);

// Read the image file as base64
const pictureFile = fs.readFileSync('<path-to-picture-file>');
const base64picture = pictureFile.toString('base64');

// Create a new picture document
const newPicture = new Picture({
    name: '<picture-name>',
    data: Buffer.from(base64picture, 'base64'),
    contentType: '<picture-content-type>'
});

// Save the picture document to the database
newPicture.save()
    .then(() => {
        console.log('Picture uploaded successfully');
    })
    .catch((error) => {
        console.error('Error uploading picture:', error);
    });