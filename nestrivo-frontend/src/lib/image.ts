import React from "react";

/**
 * Ảnh đại diện mặc định dạng SVG Data URI an toàn tuyệt đối 100%
 * Tích hợp sẵn trong mã nguồn, không phụ thuộc mạng, không bị chặn bởi AdBlocker,
 * chuẩn bảng màu ấm Nestrivo (#F4CD65, #FFF9EE, #805B10).
 */
export const DEFAULT_LISTING_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23FFF9EE'/%3E%3Cpath d='M200 80 L290 150 L270 150 L270 230 L130 230 L130 150 L110 150 Z' fill='%23F4CD65'/%3E%3Crect x='170' y='160' width='60' height='70' rx='4' fill='%23FFFFFF'/%3E%3Ccircle cx='182' cy='195' r='3.5' fill='%23805B10'/%3E%3Crect x='145' y='140' width='25' height='25' rx='3' fill='%23FFFFFF' opacity='0.9'/%3E%3Crect x='230' y='140' width='25' height='25' rx='3' fill='%23FFFFFF' opacity='0.9'/%3E%3Ctext x='200' y='265' font-family='system-ui, -apple-system, sans-serif' font-size='13' font-weight='600' fill='%23805B10' text-anchor='middle'%3ENestrivo Room%3C/text%3E%3C/svg%3E";

/**
 * Xử lý sự kiện lỗi tải ảnh chống vòng lặp vô tận (Infinite loop onError)
 */
export function handleListingImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = DEFAULT_LISTING_IMAGE
) {
  const target = e.currentTarget;
  target.onerror = null; // Ngắt vòng lặp bắt buộc
  target.src = fallbackSrc;
}

/**
 * Phân giải URL hình ảnh tin đăng an toàn
 */
export function resolveListingThumbnail(
  thumbnailUrl?: string | null,
  images?: Array<{ imageUrl?: string | null }> | null
): string {
  if (thumbnailUrl && thumbnailUrl.trim()) {
    return thumbnailUrl.trim();
  }
  if (images && images.length > 0 && images[0]?.imageUrl && images[0].imageUrl.trim()) {
    return images[0].imageUrl.trim();
  }
  return DEFAULT_LISTING_IMAGE;
}
