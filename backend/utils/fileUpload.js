import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary if credentials exist
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_KEY &&
    process.env.CLOUDINARY_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
  });
}

/**
 * Uploads a file buffer either to Cloudinary or saves it locally.
 * @param {Buffer} fileBuffer - File content buffer
 * @param {string} originalName - Original name of the file
 * @param {string} mimeType - File mimetype
 * @param {string} folder - Destination folder / directory name
 * @returns {Promise<string>} - Returns the URL or path of the uploaded file
 */
export const uploadFile = async (fileBuffer, originalName, mimeType, folder = 'general') => {
  const sanitizeName = originalName.replace(/[^a-zA-Z0-9.]/g, '_');
  const filename = `${Date.now()}-${sanitizeName}`;

  if (isCloudinaryConfigured()) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `medconnect/${folder}`,
          resource_type: 'auto',
          public_id: filename.substring(0, filename.lastIndexOf('.'))
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload failed, using local fallback:', error);
            // Fallback to local on error
            saveLocally(fileBuffer, folder, filename)
              .then(resolve)
              .catch(reject);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  } else {
    // Cloudinary not configured, use local filesystem storage
    return saveLocally(fileBuffer, folder, filename);
  }
};

const saveLocally = async (fileBuffer, folder, filename) => {
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  
  // Create directories if they don't exist
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filePath, fileBuffer);
  
  // Return relative path served by the server static route
  return `/uploads/${folder}/${filename}`;
};
