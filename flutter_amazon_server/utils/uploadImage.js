import cloudinary from "./cloudinary.js";

export const uploadMultiple = async (request, response, next) => {
  try {
    const images = request.files;
    const imageUrls = [];

    for (const image of images) {
      const result = await cloudinary.uploader.upload(image.path, {
        resource_type: "auto",
      });
      imageUrls.push(result.secure_url);
    }
    request.images = imageUrls;
    next();
  } catch (error) {
    next(error);
  }
};
