
const DiscountProductPriceBlock = ({ price, discountedPrice, isDiscounted = false, name }: { price: number, discountedPrice?: number, isDiscounted?: boolean, name: string }) => {
    return (
        <div className="px-2 py-1 text-black">
            {isDiscounted ?
                (<div className="flex items-baseline gap-2 justify-baseline">
                    <span className="font-semibold text-[#CC190C]"> Now</span>
                    <div className="flex gap-0.5"> <span className="font-semibold text-xl">
                        {discountedPrice}
                    </span> <div className="flex flex-col text-[#111] text-[0.60rem] font-semibold leading-[0.75rem] justify-center"><span className="mb-[-2px]">.00</span> <span>QAR</span></div></div>
                    <span className="line-through text-gray-500 text-sm grow"> {price}</span>
                </div>) : (
                    <div className="flex gap-0.5"> <span className="font-semibold text-xl">
                        {price}
                    </span> <div className="flex flex-col text-[#111] text-[0.60rem] font-semibold leading-[0.75rem] justify-center"><span className="mb-[-2px]">.00</span> <span className="">QAR</span></div></div>
                )}
            <p className="line-clamp-2">{name}</p>
        </div>
    )
}

export default DiscountProductPriceBlock