const { getStorage } = require("firebase-admin/storage");
const { v4: uuidv4 } = require("uuid");




/**
 * Extracts storage path from various Firebase Storage URL formats
 * @param {string} url - The storage URL
 * @returns {string|null} The storage path or null if invalid
 */
function extractStoragePath(url) {
   if (!url || typeof url !== 'string') return null;

   try {
      const decoded = decodeURIComponent(url);
      
      // Primary matching patterns (ordered by likelihood)
      const patterns = [
         // 1. Firebase Storage format (most common)
         /\/o\/(.+?)(?:\?|$)/,
         
         // 2. Google Cloud Storage format
         /storage\.googleapis\.com\/[^/]+\/(.+)/,
         
         // 3. Direct storage URL format
         /(?:[a-z0-9-]+)\.storage\.googleapis\.com\/(.+)/,
         
         // 4. Firebase download URL format
         /firebasestorage\.googleapis\.com\/[^/]+\/(.+)/,
         
         // 5. Custom domain format (if using Firebase Hosting with storage)
         /\/storage\/v1\/b\/[^/]+\/o\/(.+?)(?:\?|$)/
      ];

      // Try all patterns in order
      for (const pattern of patterns) {
         const match = decoded.match(pattern);
         if (match) return match[1];
      }

      // Fallback for known paths (if no pattern matched)
      const knownFolders = [
         'book-covers', 'moment-images', 'profile-pics',
         'user-uploads', 'attachments', 'misc'
      ];
      
      for (const folder of knownFolders) {
         const folderIndex = decoded.indexOf(`/${folder}/`);
         if (folderIndex > -1) {
         return decoded.slice(folderIndex + 1);
         }
      }

      return null;

   } catch (error) {
      console.error('Error extracting storage path:', error);
      return null;
   }
}








/**
 * Uploads a file to Firebase Storage with enhanced safety and metadata
 * @param {Buffer} fileBuffer - File data buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} destinationPath - Storage destination path
 * @returns {Promise<string>} Public download URL of uploaded file
 * @throws {Error} On validation errors or upload failures
 */

async function uploadToStorage(fileBuffer, originalName, mimetype, destinationPath) {
   // 1. Input validation
   if (!fileBuffer || !originalName || !mimetype || !destinationPath) {
      console.error('[Upload] Missing required params:', { 
         hasBuffer: !!fileBuffer, 
         originalName, 
         mimetype,
         destinationPath
      });
      throw new Error('Missing file buffer, name, or MIME type');
   }

   // 2. Validate file extension
   const fileExt = originalName.split('.').pop();
   if (!fileExt || !/^[a-z0-9]{1,6}$/i.test(fileExt)) {
      throw new Error('Invalid file extension');
   }

   // 3. Generate new filename with precise timestamp (YYYYMMDDHHMMSS)
   const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
   const now = new Date();
   const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0')
   ].join('');
   const newFilename = `${baseName}_${timestamp}.${fileExt}`;

   // 4. Update the destination path with new filename
   const pathParts = destinationPath.split('/');
   pathParts[pathParts.length - 1] = newFilename;
   const cleanPath = pathParts.join('/')
      .replace(/^\/+/, '')
      .replace(/\/+/g, '/')
      .replace(/\s+/g, '_')
      .replace(/[^\w\-./]/g, '');

   // 5. Storage setup
   const bucket = getStorage().bucket();
   if (!bucket.name) throw new Error('Storage bucket error');

   const file = bucket.file(cleanPath);
   const uploadToken = uuidv4();

   try {
      // 6. Upload with metadata
      await file.save(fileBuffer, {
         metadata: {
               contentType: mimetype,
               cacheControl: 'public, max-age=31536000',
               metadata: {
                  originalName: originalName,
                  uploadedAt: now.toISOString(),
                  firebaseStorageDownloadTokens: uploadToken,
               }
         },
      });

      // 7. Make file publicly readable
      await file.makePublic();

      // 8. Generate proper Firebase Storage URL
      const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(cleanPath)}?alt=media&token=${uploadToken}`;
      // console.log('Successfully uploaded to:', storageUrl);
      
      return storageUrl;

   } catch (err) {
      console.error('File Upload Failed:', {
         error: err.message,
         path: cleanPath,
         bucket: bucket.name,
         size: fileBuffer?.length
      });
      throw err;
   }
}






/**
 * Deletes a file from Firebase Storage using its full path
 * @param {string} filePath - The full storage path (e.g., "book-covers/uuid-filename.jpg")
 * @returns {Promise<{success: boolean, message: string}>} Deletion result
 */
async function deleteFromStorage(filePath) {
//   console.debug('deleteFromStorage called with filePath:', filePath);
  
  if (!filePath || typeof filePath !== 'string') {
    console.warn('Invalid file path provided:', filePath);
    return {
      success: false,
      message: 'Invalid file path provided'
    };
  }

  try {
    const bucket = getStorage().bucket();
   //  console.debug('Using bucket:', bucket.name);
    
    const file = bucket.file(filePath);
   //  console.debug('File object created for path');

    // Check if file exists before attempting deletion
    const [exists] = await file.exists();
   //  console.debug('File existence check result:', exists);
    
    if (!exists) {
      console.warn('File does not exist');
      return {
        success: false,
        message: 'File does not exist in storage'
      };
    }

   //  console.log('Attempting to delete file');
    await file.delete();
    console.log('Deleted file:', filePath);
    
    return {
      success: true,
      message: `Successfully deleted file: ${filePath}`
    };

  } catch (error) {
   //  console.error(`Error deleting file :`, error);
    console.error('Error deleting file - details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    return {
      success: false,
      message: `Failed to delete file: ${error.message}`
    };
  }
}




module.exports = {
  extractStoragePath,
  uploadToStorage,
  deleteFromStorage
};