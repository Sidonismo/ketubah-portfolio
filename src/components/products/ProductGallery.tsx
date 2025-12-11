'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/style.css';

interface ProductImage {
  image: {
    url?: string;
    width?: number;
    height?: number;
    sizes?: {
      thumbnail?: { url?: string };
      full?: { url?: string; width?: number; height?: number };
    };
  };
  alt: string;
  isMain?: boolean;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(() => {
    const mainIndex = images.findIndex((img) => img.isMain);
    return mainIndex >= 0 ? mainIndex : 0;
  });

  const activeImage = images[activeIndex];
  const mainImageUrl = activeImage?.image?.sizes?.full?.url || activeImage?.image?.url || '/placeholder.jpg';
  const mainImageWidth = activeImage?.image?.sizes?.full?.width || activeImage?.image?.width || 1200;
  const mainImageHeight = activeImage?.image?.sizes?.full?.height || activeImage?.image?.height || 900;

  // Vypočítáme aspect ratio z rozměrů obrázku
  const aspectRatio = mainImageWidth / mainImageHeight;

  return (
    <div className="space-y-4">
      {/* Hlavní obrázek s lightbox */}
      <Gallery>
        <div
          className="relative bg-card-bg rounded-lg overflow-hidden group cursor-zoom-in"
          style={{ aspectRatio: aspectRatio.toString() }}
        >
          <Item
            original={mainImageUrl}
            thumbnail={mainImageUrl}
            width={mainImageWidth}
            height={mainImageHeight}
            alt={activeImage?.alt || productName}
          >
            {({ ref, open }) => (
              <>
                <Image
                  ref={ref as unknown as React.RefObject<HTMLImageElement>}
                  src={mainImageUrl}
                  alt={activeImage?.alt || productName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  onClick={open}
                  priority
                />
                {/* Zoom icon */}
                <button
                  onClick={open}
                  className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Zvětšit obrázek"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </button>
              </>
            )}
          </Item>
        </div>
      </Gallery>

      {/* Thumbnail galerie */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => {
            const thumbUrl = image.image?.sizes?.thumbnail?.url || image.image?.url || '/placeholder.jpg';
            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`relative w-20 h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                  index === activeIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <Image
                  src={thumbUrl}
                  alt={image.alt || `${productName} - ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
