import PageContainer from "@/components/pageContainer";
import Image from "next/image";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { TriangleAlert } from "lucide-react";
const ReturnPolicyData = [
    {
        question: "Our Refund Policy",
        content: `
        <p>If any of our products fall below the high standard you expect, we will happily refund or exchange it according to the terms and conditions set out below.</p>
        <p>- If ansargallery.com is unable to obtain products: a reasonable time of 7-10 days from the date of the order has to be given.</p>
        <p>- Products faulty on arrival and non-repairable.</p>
        <p>- Refunds for products purchased under a promotional offer will be based on the terms of the promotional price. Bundle offers or "Buy 1 Get 1 free" offers: In this case, you will have to return all the items in this offer.</p>
        <p>- Refund settlement will take place once the returned product has been received back and a quality check has taken place, this procedure normally takes 4-5 days, then 2 business days to issue the refund. Please be aware that sometimes the refund will not show on your account until the next statement cycle is issued from your bank.</p>
        <p>- We will refund the delivery charge in full if the product received is faulty / damaged and you return all products of your order at the same time. If you choose to keep some of the products, we will retain the balance of the delivery charge that applies to the products you keep.</p>
        <p>- Please keep all items with their complete packaging and inside packaging intact if you intend to refund any items within the conditions set out. No exchange or refund will be considered without it.</p>
        <p>- 7 Days money back Guarantee if you change your mind, provided that the merchandise is as new, in a re-sellable condition and the consumables (cartridges, blank tapes, CDs or DVDs) and accessories (cables, chargers, batteries...) are still sealed</p>
        <p><strong>, a refund can be granted upon ansargallery.com approval within 7 days of delivery. (Exceptions apply, see Electrical returns) However, the normal delivery or supplier delivery charge, as well as card transaction charges, will be charged back as well as any additional charges incurred by courier collection if applicable.</strong></p>
    `
    },
    {
        // add cation icon at the end of the question using lucide-react icon
        question: (
            <span className="flex items-center gap-2">
                Virtual/Digital Products Refund Policy <TriangleAlert className="h-5 w-5 " />
            </span>
        ),
        content: `
        <strong>No Refunds:</strong> <p>Orders cannot be refunded once placed.</p> </br>
        <strong>No Returns:</strong> <p>We do not accept returns on purchased items.</p>
        `,

    },
    {
        question: "Our Standard refund policy",
        content: `
            <p>All orders will be refunded if the product is received <strong>Faulty/damaged</strong> within a <strong>3-day period</strong> if the product is found to be Faulty (Exceptions apply to electrical returns) in such cases the product must be returned with all correct manuals, packaging intact and all correct cables that came with the product, if any of these are found to be incorrect then the refund will not be processed. (Contact customer services for courier uplift date)</p>
            <p>After the <strong>3 day window</strong> for refund of faulty products any product that becomes will be subject to the manufactures warranty, ansargallery.com customer support can assist in directing you to a Ansar Gallery's location so that after-sales service with the supplier can be arranged. (Where applicable)</p>
            <p>Any product past the initial period of refund as set out above and after the manufacturer warranty period will not be eligible for either refund or exchange.</p>
        `
    },
    {
        question: "Supplier delivered and large products",
        content: `
            <p>If the product was delivered to your home or office by a courier, we can arrange a courier collection for its return. Call customer services <strong>4448 6000</strong> to arrange this. Please make sure collected products are well packaged for their return journey all outer packaging must be in the condition it was received in.</p>
        `
    },
    {
        question: "Ansar Gallery delivered products",
        content: `
            <p>Larger products or products that are delivered directly by one of our suppliers. To return these products call our customer services <strong>4448 6000</strong>. We'll arrange for the supplier to contact you to agree a suitable collection date.</p>
            <p>Ansar Gallery will not be replacing or refunding any product purchased through the ansargallery.com website, all refunds/exchanges will be managed and accepted by the ansargallery.com customer services team <strong>4448 6000</strong></p>
        `
    },
    {
        question: "How to exchange or replace a product",
        content: `
            <p>In case of an incident where a replacement product may be required again please contact the customer services team who will arrange this in line with the Terms & Conditions for replacement and/or faulty products.</p>
        `
    },
    {
        question: "Electrical Returns",
        content: `
            <p>We are unable to accept returns of the below-mentioned item unless found defective within <strong>3 days</strong> of receipt on imaging and recording products, these include:</p>
            <p>- MP3/4 players</p>
            <p>- Digital cameras and photo frames</p>
            <p>- Camcorders</p>
            <p>- Hard drives and USB devices</p>
            <p>- Software, CD DVD's Cartridges Blank CD DVDs</p>
            <p>- Laptop / desktops / netbooks / tablet</p>
            <p>- Satellite navigation systems</p>
            <p>- Games consoles and games</p>
            <p>- Hygienic items (Hair care, dental items)</p>
            <p>- Smartphones / Mobiles</p>
        `
    },
    {
        question: "Grocery Return",
        content: `
      <table style="width: 100%; border-collapse: separate; border-spacing: 20px 10px;">
            <tr>
                <th style="text-align: left;">Product</th>
                <th style="text-align: left;">Period of Return</th>
            </tr>
            <tr>
                <td>Perishable goods (e.g. meat, vegetables, fresh food)</td>
                <td>Within 24 hours.</td>
            </tr>
            <tr>
                <td>Non-perishable goods (e.g. toiletries, cleaning products)</td>
                <td>Up to 7 days</td>
            </tr>
        </table>
        `
    },
    {
        question: "Apparel Return & Exchange",
        content: `
            <p>All products to be exchanged must be returned in their original packaging along with the original sales receipt within  <strong>7 days from the date of delivery</strong> (Product should be in its original condition). Items like lingerie/socks/inner-wear/swim-wear are non-returnable due to hygiene conditions. However, in the unlikely event of a damaged, defective or different item delivered to you, we will provide full refund or replacement if available.</p>
        `
    },
    {
        question: "Building Material & Hardware Returns",
        content: `
            <p>You may return your hardware within <strong>7 days</strong> of it being delivered to you, as long as it is in new condition and has the original packaging. No returns are accepted over <strong>7 days</strong>. We only accept returns of the hardware we sell directly to you. If we suspect you're abusing the return policy (for example by returning products on multiple occasions or on a seasonal basis), we reserve the right to refuse your return.</p>
        `
    },
    {
        question: "Charges and getting your refund",
        content: `
            <p>Returns are free of charge for received items. Charges will apply for items where you the customer change your mind after the product has been shipped.</p>
        `
    },
    {
        question: "Delivery charges",
        content: `
            <p>If you have told us you're going to return all of your orders within <strong>three working days</strong> of receiving it due to faulty products we will refund your delivery charge in full. If you're only returning some of the products, or all of the products but after the <strong>three working day period</strong>, your delivery charge will <strong>not be refunded</strong> and further charges for uplift may apply</p>
        `
    },
    {
        question: "Getting your refund",
        content: `
            <p>All valid refund for orders paid in cash or card on delivery will be refunded in cash. Furthermore for order paid online via card the refund will be to your bank account. Please be aware that sometimes the refund will not show on your account until the next statement cycle is issued from your bank.</p>
        `
    }
];

const ReturnPolicy = () => {
    return (
        <PageContainer>
            <div className="flex flex-col lg:grid lg:grid-cols-2 min-h-[400px] items-center justify-center bg-white lg:px-8 px-2 lg:py-12 py-4">
                <div className="flex flex-col gap-4">
                    <h1 className="lg:text-4xl text-3xl font-bold text-gray-900">Return Policy</h1>
                    <p className="lg:text-base text-sm text-gray-600"> <strong>Bought from ansargallery.com?</strong> Here is everything you need to know to get a smooth and successful refund or return</p>
                </div>

                <div className="relative w-full h-[300px] lg:h-[400px]">
                    <Image
                        src="/images/returnPolicy.webp"
                        alt="Return Policy"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <div className=" lg:pb-10 pb-8 max-w-full mx-auto my-4">
                <Accordion type="multiple" className="w-full space-y-4 bg">
                    {ReturnPolicyData.map((item, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-none bg-white rounded-xl px-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <AccordionTrigger className="text-base lg:text-lg font-semibold hover:no-underline py-5 text-gray-800">
                                <span>{item.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600 text-sm lg:text-base pb-6 leading-relaxed">
                                <span dangerouslySetInnerHTML={{ __html: item.content }} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </PageContainer>
    );
};

export default ReturnPolicy;
