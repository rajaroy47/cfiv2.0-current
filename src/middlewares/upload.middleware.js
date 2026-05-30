import multer from "multer";


// ======================================
// MEMORY STORAGE
// ======================================
const storage = multer.memoryStorage();


// ======================================
// FILE FILTER
// ======================================
const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
    ];

    if (
        allowedMimeTypes.includes(file.mimetype)
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only PNG, JPG, JPEG and PDF files are allowed"
            ),
            false
        );
    }
};


// ======================================
// MULTER CONFIG
// ======================================
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter
});

export default upload;