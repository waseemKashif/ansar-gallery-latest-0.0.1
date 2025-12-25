import Image from "next/image";
import { HTMLAttributes } from "react";
import placeholderImage from "@/public/images/placeholder.jpg";
interface ImageCardProps extends HTMLAttributes<HTMLDivElement> {
  images: string[];
  alt: string;
  width?: number;
  height?: number;
}
export default function ImageCardLts({
  images,
  alt,
  width = 300,
  height = 300,
  ...props
}: ImageCardProps) {
  const hasHoverImage = images?.length > 1;
  // const baseImgaeUrl =
  //   process.env.BASE_IMAGE_URL ||
  //   "https://www.ansargallery.com/media/catalog/product/";
  console.log(images)
  return (
    <div
      {...props}
      className={`relative  inline-block ${hasHoverImage ? "group" : ""
        } ${props.className ?? ""}`}
    >
      {/* First Image */}
      <Image
        src={images[0] || placeholderImage}
        alt={alt}
        width={width}
        height={height}
        // className={`object-cover transition-opacity duration-500 ${
        //   hasHoverImage ? "group-hover:opacity-0" : ""
        // }`}
        className={`object-cover transition-opacity duration-500 ${hasHoverImage ? "group-hover:scale-105" : ""
          }`}
      />

      {/* Second Image (on hover) */}
      {/* {hasHoverImage && (
        <Image
          src={`${baseImgaeUrl}${images[5].value}`}
          alt={`${alt} hover`}
          width={width}
          height={height}
          className="object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )} */}
    </div>
  );
}
