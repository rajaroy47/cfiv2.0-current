import cloudinary from "../config/cloudinary.js";


// ======================================
// UPLOAD TO CLOUDINARY
// ======================================
export const uploadToCloudinary = async (
    fileBuffer,
    folder = "cfi-v2"
) => {

    return new Promise((resolve, reject) => {

        cloudinary.uploader
            .upload_stream(
                {
                    folder,
                    resource_type: "auto"
                },
                (error, result) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            )
            .end(fileBuffer);
    });
};


// ======================================
// DELETE FROM CLOUDINARY
// ======================================
export const deleteFromCloudinary = async (
    publicId
) => {

    return await cloudinary.uploader.destroy(
        publicId
    );
};