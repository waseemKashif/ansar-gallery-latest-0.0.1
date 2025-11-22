"use client";
import { useState } from "react";
import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import { cn } from "@/lib/utils";
const ProductImagesLTS = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const baseImgaeUrl =
    process.env.BASE_IMAGE_URL ||
    "https://www.ansargallery.com/media/catalog/product";
  // console.log("image",`${baseImgaeUrl}${images[0]}`)
  // console.log('base url', baseImgaeUrl)
  return (
    <div className=" space-y-4">
      <Image
        src={images ? `${baseImgaeUrl}${images[current]}` : placeholderImage}
        alt="product Image"
        width={1000}
        height={1000}
        className=" min-h-[300px] object-cover object-center"
        loading="lazy"
      />
      <div className="flex">
        {images.map((image, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => setCurrent(index)}
            className={cn(
              " border-2 mr-2  cursor-pointer hover:border-[#b7d635]",
              current === index && "border-[#b7d635]"
            )}
          >
            <Image
              src={`${baseImgaeUrl}${image}`}
              alt="image"
              width={100}
              height={100}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImagesLTS;
