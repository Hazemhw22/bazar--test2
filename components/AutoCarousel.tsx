// components/AutoCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AutoCarouselProps {
  images: string[];
  alt?: string;
  interval?: number; // الوقت بين تغيير الصور بالمللي ثانية
}

export default function AutoCarousel({
  images,
  alt = "Carousel Image",
  interval = 10000,
}: AutoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-full rounded-xl overflow-hidden">
      {images.map((src, index) => (
        <Image
          key={index}
          src={src}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-1000 absolute top-0 left-0 w-full h-full ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
