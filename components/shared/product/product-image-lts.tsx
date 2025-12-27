"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import placeholderImage from "@/public/images/placeholder.jpg";
import { cn } from "@/lib/utils";
import { StaticImageData } from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const ProductImagesLTS = ({ images }: { images: (string | StaticImageData)[] }) => {
  const [current, setCurrent] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const productImageBaseUrl =
    process.env.NEXT_PUBLIC_PRODUCT_IMG_URL ||
    "https://www.ansargallery.com/media/catalog/product";

  const getImageUrl = (image: string | StaticImageData) => {
    if (typeof image === "string") {
      if (image.startsWith("http")) return image;
      return `${productImageBaseUrl}${image}`;
    }
    return image;
  };

  // Ensure images is always an array
  const imageList = Array.isArray(images) ? images : [images].filter(Boolean);

  if (imageList.length === 0) {
    imageList.push(placeholderImage);
  }

  // Update current state when carousel scrolls
  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (api) {
      api.scrollTo(index);
    } else {
      setCurrent(index);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
        {/* Main Carousel View */}
        <Carousel setApi={setApi} className="w-full relative group">
          <CarouselContent>
            {imageList.map((image, index) => (
              <CarouselItem key={index}>
                <div
                  className="overflow-hidden relative w-full aspect-square cursor-zoom-in bg-white"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={`Product Image ${index + 1}`}
                    fill
                    className="object-contain object-center"
                    loading={index === 0 ? "eager" : "lazy"}
                    placeholder="blur"
                    blurDataURL={
                      typeof placeholderImage === "string"
                        ? placeholderImage
                        : placeholderImage.src
                    }
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {imageList.length > 1 && (
            <>
              <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </Carousel>

        {/* Thumbnails */}
        {imageList.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {imageList.map((image, index) => (
              <div
                key={index}
                role="button"
                tabIndex={0}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "border-2 rounded-md overflow-hidden cursor-pointer hover:border-[#b7d635] relative w-20 h-20 flex-shrink-0 transition-all",
                  current === index
                    ? "border-[#b7d635] opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
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
        )}

        {/* Dialog Content (Lightbox) */}
        <DialogContent showCloseButton={false} className="max-w-[95vw] w-full h-[95vh] p-0 border-none bg-black/95 text-white overflow-hidden flex flex-col items-center justify-center focus:outline-none z-60">
          {/* Accessible Title */}
          <DialogTitle className="sr-only">Product Image Zoom View</DialogTitle>

          {/* Custom Close Button */}
          <button
            onClick={() => setIsDialogOpen(false)}
            className="absolute cursor-pointer top-4 right-4 z-[60] p-2 bg-black/50 rounded-full hover:bg-black/80 text-white transition-colors"
            aria-label="Close zoom view"
          >
            <X className="w-5 h-5" />
          </button>

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-4 left-4 z-[60] flex gap-2">
                  <button onClick={() => zoomIn()} className="p-2 bg-black/50 rounded-full hover:bg-black/80 text-white transition-colors" title="Zoom In">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={() => zoomOut()} className="p-2 bg-black/50 rounded-full hover:bg-black/80 text-white transition-colors" title="Zoom Out">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button onClick={() => resetTransform()} className="p-2 bg-black/50 rounded-full hover:bg-black/80 text-white transition-colors" title="Reset">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                <TransformComponent
                  wrapperClass="!w-full !h-full flex items-center justify-center"
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <div className="relative w-full h-full min-w-[300px] min-h-[300px] flex items-center justify-center">
                    <Image
                      src={getImageUrl(imageList[current])}
                      alt="Zoomed Product Image"
                      fill
                      className="object-contain"
                      quality={100}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImagesLTS;
