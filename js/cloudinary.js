// js/cloudinary.js
// Centralized Cloudinary image upload utility for CHEENO

/**
 * Default Cloudinary configuration.
 * Automatically checks secrets.md, window globals, and localStorage.
 */
let secretsLoaded = false;
let parsedSecrets = {};

export async function loadSecrets() {
  if (secretsLoaded) return parsedSecrets;
  try {
    const res = await fetch('secrets.md');
    if (res.ok) {
      const text = await res.text();
      const cloudMatch = text.match(/CLOUDINARY_CLOUD_NAME\s*=\s*([^\r\n#\s]+)/i);
      const presetMatch = text.match(/CLOUDINARY_UPLOAD_PRESET\s*=\s*([^\r\n#\s]+)/i);
      if (cloudMatch && cloudMatch[1] && !cloudMatch[1].includes('your_cloud_name')) {
        parsedSecrets.cloudName = cloudMatch[1].trim();
      }
      if (presetMatch && presetMatch[1] && !presetMatch[1].includes('your_unsigned_preset')) {
        parsedSecrets.uploadPreset = presetMatch[1].trim();
      }
    }
  } catch (e) {
    // secrets.md not reachable in current context
  }
  secretsLoaded = true;
  return parsedSecrets;
}

export const CLOUDINARY_CONFIG = {
  cloudName: window.CLOUDINARY_CLOUD_NAME || localStorage.getItem('cheeno_cloudinary_cloud') || 'drtavai9l',
  uploadPreset: window.CLOUDINARY_UPLOAD_PRESET || localStorage.getItem('cheeno_cloudinary_preset') || 'cheeno_uploads'
};

/**
 * Compress an image file on the client before uploading or fallback.
 * @param {File} file
 * @param {number} maxDimension
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
export function compressImage(file, maxDimension = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          },
          'image/jpeg',
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Convert Blob or File to Data URL
 * @param {Blob|File} blob
 * @returns {Promise<string>}
 */
export function fileToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Upload an image file to Cloudinary.
 * If Cloudinary preset is unconfigured or fails, gracefully falls back to optimized Base64
 * to guarantee zero user friction while retaining instant display.
 *
 * @param {File|Blob} file - Image file or blob to upload
 * @param {Object} options - { folder, cloudName, uploadPreset, tags }
 * @returns {Promise<{ ok: boolean, url: string, publicId?: string, isFallback?: boolean }>}
 */
export async function uploadToCloudinary(file, options = {}) {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // File size validation (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit.');
  }

  const secrets = await loadSecrets();
  const cloudName = options.cloudName || window.CLOUDINARY_CLOUD_NAME || secrets.cloudName || localStorage.getItem('cheeno_cloudinary_cloud') || CLOUDINARY_CONFIG.cloudName;
  const uploadPreset = options.uploadPreset || window.CLOUDINARY_UPLOAD_PRESET || secrets.uploadPreset || localStorage.getItem('cheeno_cloudinary_preset') || CLOUDINARY_CONFIG.uploadPreset;
  const folder = options.folder || 'cheeno';

  try {
    // Compress first for fast upload
    const compressedBlob = await compressImage(file, 1400, 0.85);

    const formData = new FormData();
    formData.append('file', compressedBlob);
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ok: true,
        url: data.secure_url || data.url,
        publicId: data.public_id,
        isFallback: false
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      console.warn('Cloudinary upload warning:', errData);
      
      // Fallback to client-side compressed data URL
      const dataUrl = await fileToDataUrl(compressedBlob);
      return {
        ok: true,
        url: dataUrl,
        isFallback: true
      };
    }
  } catch (err) {
    console.warn('Cloudinary network exception, applying local fallback:', err);
    try {
      const compressedBlob = await compressImage(file, 1000, 0.8);
      const dataUrl = await fileToDataUrl(compressedBlob);
      return {
        ok: true,
        url: dataUrl,
        isFallback: true
      };
    } catch (e) {
      throw new Error(`Image upload failed: ${err.message}`);
    }
  }
}

/**
 * Initialize a full drag-and-drop or file input upload UI element.
 * @param {Object} config
 */
export function setupImageUploader({
  dropZone,
  fileInput,
  previewContainer,
  previewImg,
  removeBtn,
  folder = 'cheeno',
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  onRemove
}) {
  if (!dropZone || !fileInput) return;

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      if (onUploadError) onUploadError(new Error('Please select an image file (JPG, PNG, WEBP).'));
      return;
    }

    if (onUploadStart) onUploadStart();

    try {
      const res = await uploadToCloudinary(file, { folder });
      if (res.ok) {
        if (previewImg) previewImg.src = res.url;
        if (previewContainer) previewContainer.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
        if (onUploadSuccess) onUploadSuccess(res.url, res);
      }
    } catch (err) {
      if (onUploadError) onUploadError(err);
    }
  };

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.value = '';
      if (previewImg) previewImg.src = '';
      if (previewContainer) previewContainer.style.display = 'none';
      if (dropZone) dropZone.style.display = 'block';
      if (onRemove) onRemove();
    });
  }
}
