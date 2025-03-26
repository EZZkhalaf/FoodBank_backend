const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pictures', // Folder name ion the cloudinary website
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  },
});

const upload = multer({ storage });

module.exports = upload;
