"use client";
import { useState } from "react";
import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import { cn } from "@/lib/utils";
import { StaticImageData } from "next/image";
const ProductImagesLTS = ({ images }: { images: (string | StaticImageData)[] }) => {
  const [current, setCurrent] = useState(0);
  const productImageBaseUrl = process.env.NEXT_PUBLIC_PRODUCT_IMG_URL || "https://www.ansargallery.com/media/catalog/product";

  const getImageUrl = (image: string | StaticImageData) => {
    if (typeof image === 'string') {
      if (image.startsWith('http')) return image;
      return `${productImageBaseUrl}${image}`;
    }
    return image;
  }

  // Ensure images is always an array
  const imageList = Array.isArray(images) ? images : [images].filter(Boolean);

  if (imageList.length === 0) {
    imageList.push(placeholderImage);
  }

  return (
    <div className=" space-y-4">
      <div className="border border-gray-200 rounded-md overflow-hidden relative w-full aspect-square">
        <Image
          src={getImageUrl(imageList[current])}
          alt="product Image"
          fill
          className="object-contain object-center"
          loading="lazy"
          placeholder="blur"
          blurDataURL={typeof placeholderImage === 'string' ? placeholderImage : placeholderImage.src}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {imageList.map((image, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => setCurrent(index)}
            className={cn(
              "border-2 rounded-md overflow-hidden cursor-pointer hover:border-[#b7d635] relative w-20 h-20 flex-shrink-0",
              current === index ? "border-[#b7d635]" : "border-transparent"
            )}
          >
            <Image
              src={getImageUrl(image)}
              alt={`thumbnail-${index}`}
              fill
              className="object-cover object-center"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImagesLTS;
