import Image from "next/image";
import { HTMLAttributes } from "react";

interface ImageCardProps extends HTMLAttributes<HTMLDivElement> {
  images: string[];
  alt: string;
  width?: number;
  height?: number;
}

export default function ImageCard({
  images,
  alt,
  width = 300,
  height = 300,
  ...props
}: ImageCardProps) {
  const hasHoverImage = images.length > 1;

  return (
    <div
      {...props}
      className={`relative overflow-hidden  rounded-t-2xl  inline-block ${
        hasHoverImage ? "group" : ""
      } ${props.className ?? ""}`}
    >
      {/* First Image */}
      <Image
        src={images[0]}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-opacity duration-500 ${
          hasHoverImage ? "group-hover:opacity-0" : ""
        }`}
      />

      {/* Second Image (on hover) */}
      {hasHoverImage && (
        <Image
          src={images[1]}
          alt={`${alt} hover`}
          width={width}
          height={height}
          className="object-cover absolute top-0 left-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </div>
  );
}
