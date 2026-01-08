import { DeliveryItemsType } from "@/types";
import Image from "next/image";
import Link from "next/link";
const ProductsDetailsSlider = ({ data }: { data: DeliveryItemsType }) => {
    const productImageUrl = process.env.NEXT_PUBLIC_PRODUCT_IMG_URL;
    return (
        <div className="flex flex-col h-full w-full">
            <div className="text-lg font-semibold flex-none p-2 border-b bg-white z-10 sticky top-0" title={data.title}>{data.title} </div>
            <div className="flex-1 overflow-y-auto p-0 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-2">
                {data?.data.map((item, index) => (
                    <div key={index} className="flex justify-between gap-1 flex-1 items-center">
                        <div className="flex gap-1 items-center">
                            <Image src={`${productImageUrl}/${item.image}`} alt={item.name} width={100} height={100} />
                            <div>
                                <h2 className="text-sm font-semibold">{item.name}</h2>
                                <p className="text-xs text-gray-500">{item.qty} x {item.price}</p>
                            </div>
                        </div>
                        <p className="text-base font-semibold"> <span className="text-xs font-normal text-gray-500">QAR</span> {item.qty * item.price}</p>
                    </div>
                ))}
            </div>

            <Link href="/cart" title="go to cart" className=" rounded-md flex-none p-2 border-t z-10 sticky bottom-1 text-center bg-black text-white">Go to Cart</Link>

        </div>
    );
};

export default ProductsDetailsSlider;