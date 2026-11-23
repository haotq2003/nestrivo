export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
}

export interface UploadOptions {
  folder?: string;
  uploadPreset?: string;
  onProgress?: (percent: number) => void;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dturncvxv";
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "467984999236351";

/**
 * Tải ảnh lên Cloudinary qua Next.js Server Route Handler (/api/upload)
 * Sử dụng API Key & API Secret an toàn phía server
 */
export async function uploadImageToCloudinary(
  file: File,
  options?: UploadOptions
): Promise<CloudinaryUploadResult> {
  const folder = options?.folder || "nestrivo/listings";

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    // Lắng nghe % tiến trình upload
    if (xhr.upload && options?.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress?.(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({
            url: data.url,
            secureUrl: data.secureUrl || data.url,
            publicId: data.publicId,
            format: data.format,
            width: data.width,
            height: data.height,
            bytes: data.bytes,
            originalFilename: data.originalFilename || file.name,
          });
        } catch {
          reject(new Error("Lỗi phân tích kết quả trả về từ máy chủ."));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData?.message || `Tải ảnh thất bại (HTTP ${xhr.status})`));
        } catch {
          reject(new Error(`Tải ảnh thất bại (HTTP ${xhr.status}).`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Lỗi mạng khi tải ảnh lên máy chủ Cloudinary. Vui lòng kiểm tra lại kết nối."));
    };

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    xhr.send(formData);
  });
}

/**
 * Tải đồng thời danh sách nhiều ảnh lên Cloudinary
 */
export async function uploadMultipleImagesToCloudinary(
  files: File[],
  options?: UploadOptions & { onFileProgress?: (index: number, percent: number) => void }
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const res = await uploadImageToCloudinary(file, {
      ...options,
      onProgress: (percent) => {
        options?.onFileProgress?.(i, percent);
      },
    });
    results.push(res);
  }

  return results;
}

export const uploadService = {
  uploadImage: uploadImageToCloudinary,
  uploadMultiple: uploadMultipleImagesToCloudinary,
  cloudName: CLOUD_NAME,
  apiKey: API_KEY,
};
