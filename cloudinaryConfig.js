const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// async function uploadImage() {
//   try {
//     const uploadResult = await cloudinary.uploader.upload(
//       'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
//       { public_id: 'shoes' }
//     );
//     console.log(uploadResult);
//   } catch (error) {
//     console.error(error);
//   }
// }

// uploadImage(); // Call the function

module.exports = cloudinary;
