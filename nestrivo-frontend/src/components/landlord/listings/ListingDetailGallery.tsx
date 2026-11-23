"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Image as ImageIcon,
  Sparkles
} from "lucide-react";
import { ListingImage } from "@/types/listing";

interface ListingDetailGalleryProps {
  images: ListingImage[];
  title: string;
}

export function ListingDetailGallery({
  images,
  title,
}: ListingDetailGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 sm:h-80 bg-slate-100 rounded-2xl border border-slate-200/90 flex flex-col items-center justify-center text-slate-400 gap-2">
        <ImageIcon className="w-10 h-10" />
        <span className="text-xs sm:text-sm font-medium">Chưa có hình ảnh nào cho tin đăng này</span>
      </div>
    );
  }

  const currentImage = images[activeIndex] || images[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Display Image */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer border border-slate-200 shadow-2xs"
        >
          <Image
            src={currentImage.imageUrl}
            alt={`${title} - ảnh ${activeIndex + 1}`}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-300"
            priority
            unoptimized
          />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {activeIndex === 0 && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F4CD65] text-[#292524] shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#292524]" />
                <span>Ảnh bìa</span>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/70 text-white backdrop-blur-xs shadow-md">
              {activeIndex + 1} / {images.length}
            </span>
          </div>

          {/* Fullscreen icon button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/70 text-white backdrop-blur-xs hover:bg-slate-900 transition-colors shadow-md"
            title="Xem toàn màn hình"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Prev / Next buttons on main image */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors shadow-md"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors shadow-md"
                aria-label="Ảnh kế tiếp"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeIndex === idx
                    ? "border-[#F4CD65] ring-2 ring-[#F4CD65]/40 scale-98"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal View */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Top modal bar */}
          <div className="w-full flex items-center justify-between text-white z-10 max-w-5xl">
            <div className="text-sm font-semibold truncate pr-4">
              {title} ({activeIndex + 1} / {images.length})
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Centered Large Image */}
          <div 
            className="relative w-full max-w-5xl h-[65vh] sm:h-[75vh] flex items-center justify-center my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.imageUrl}
              alt={title}
              fill
              className="object-contain"
              unoptimized
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
                  aria-label="Ảnh kế tiếp"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnails bar in modal */}
          <div 
            className="flex items-center gap-2 max-w-xl overflow-x-auto pb-2 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-14 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                  activeIndex === idx ? "border-[#F4CD65] opacity-100" : "border-transparent opacity-50"
                }`}
              >
                <Image
                  src={img.imageUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

