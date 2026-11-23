"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { ListingImage } from "@/types/listing";

interface ListingGalleryProps {
  images: ListingImage[];
  title: string;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80";

export default function ListingGallery({ images, title }: ListingGalleryProps) {
  const validImages =
    images && images.length > 0
      ? images
      : [{ id: "def", listingId: "def", imageUrl: DEFAULT_IMAGE, sortOrder: 0 }];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const currentImg = validImages[selectedIdx] || validImages[0];
  const currentUrl = imgError[selectedIdx] ? DEFAULT_IMAGE : currentImg.imageUrl;

  const maxThumbnails = 5;
  const showOverflowBadge = validImages.length > maxThumbnails;
  const displayedThumbs = validImages.slice(0, maxThumbnails);
  const remainingCount = validImages.length - maxThumbnails;

  return (
    <div className="space-y-3">
      {/* Hero Primary Image */}
      <div className="relative aspect-[16/10] sm:h-[460px] w-full rounded-3xl overflow-hidden bg-slate-100 border border-[#E5E7EB] shadow-xs group">
        <img
          src={currentUrl}
          alt={title}
          onError={() => setImgError((prev) => ({ ...prev, [selectedIdx]: true }))}
          className="w-full h-full object-cover transition-all duration-300"
          loading="eager"
        />

        {/* Counter Badge */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-1.5 shadow-sm">
          <Camera className="w-3.5 h-3.5 text-white/90" />
          <span>
            {selectedIdx + 1} / {validImages.length}
          </span>
        </div>
      </div>

      {/* Thumbnails (show if more than 1 image) */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
          {displayedThumbs.map((img, idx) => {
            const isSelected = idx === selectedIdx;
            const thumbUrl = imgError[idx] ? DEFAULT_IMAGE : img.imageUrl;
            const isLastWithOverflow = showOverflowBadge && idx === maxThumbnails - 1;

            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`relative h-16 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? "border-[#F4CD65] ring-2 ring-[#F4CD65]/40 shadow-xs"
                    : "border-[#E5E7EB] opacity-75 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`${title} - ảnh ${idx + 1}`}
                  onError={() => setImgError((prev) => ({ ...prev, [idx]: true }))}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {isLastWithOverflow && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                    +{remainingCount + 1}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
