import { Locale } from "@/lib/i18n";
import React from "react";
import Link from "next/link";


export const getSeoContent = (lang: Locale) => {

    const LinkFormatter = ({ children, href }: { children: React.ReactNode, href: string }) => {
        return (
            <Link href={href} className="text-blue-600 hover:underline">
                {children}
            </Link>
        )
    }
    if (lang === 'en') {
        return [
            {
                title: "Premier Online Shopping in Qatar",
                content: (
                    <>
                        <p>
                            As the premier online shopping store in Qatar, Ansar Gallery Qatar provides a comprehensive range of products, making it your primary source for everything you need. Whether you&apos;re in search of the latest <LinkFormatter href="/electronics">electronics</LinkFormatter>, <LinkFormatter href="/mobile-phones/smartphones">mobile phones</LinkFormatter>, <LinkFormatter href="/home-office-furnishing/furniture">furniture</LinkFormatter>, <LinkFormatter href="/furnishing/carpets-rugs">carpets</LinkFormatter>, <LinkFormatter href="/books">books</LinkFormatter>, <LinkFormatter href="/stationery">stationery</LinkFormatter>, <LinkFormatter href="/sports-outdoors/sports-fitness-accessories">sports and fitness equipment</LinkFormatter>, <LinkFormatter href="/beauty-personal-care/cosmetics">cosmetics</LinkFormatter>, or <LinkFormatter href="/grocery">groceries</LinkFormatter>, <strong>Ansar Gallery Qatar Store</strong> has you covered with a vast selection.
                            <br />
                            Our customer-centric approach sets us apart, offering an extensive product range, a user-friendly shopping app, and much more to simplify your online shopping experience. At Ansar Gallery Qatar, we are committed to delivering the best possible service to our customers. We provide nationwide delivery across Qatar, making it convenient for you to access our superstore&apos;s diverse departments and exceptional customer service. Beyond being a typical online shop, we strive to exceed expectations by ensuring stress-free shopping experiences and offering products known for long-term quality. Save both time and effort by indulging in one-stop shopping from the comfort of your home. Benefit from the added convenience of free shipping on orders exceeding a specified amount when you shop online with us.
                        </p>
                    </>
                )
            },
            {
                title: "Shop The Best Products and Brands at Ansar Gallery Qatar",
                content: (
                    <>
                        <p>
                            Discover an extensive array of top-notch products and renowned brands at Ansar Gallery Qatar. Our electronics selection boasts <LinkFormatter href="/electronics/computers/laptops-pc" >laptops</LinkFormatter>, <LinkFormatter href="/electronics/audio/headphones-earbuds" >headphones</LinkFormatter> (including in-ear, wireless, and noise-cancelling options), audiovisual gear, <LinkFormatter href="/electronics/cameras">cameras</LinkFormatter>, <LinkFormatter href="/electronics/tv">televisions</LinkFormatter>, and <LinkFormatter href="/electronics/gaming/gaming-consoles">gaming consoles</LinkFormatter> such as PC, PlayStation, Xbox, along with controllers and video games. <LinkFormatter href="/brand">Brands</LinkFormatter> like <LinkFormatter href="brand/samsung" >Samsung</LinkFormatter>, <LinkFormatter href="brand/mi" >Xiaomi</LinkFormatter>, <LinkFormatter href="brand/sony" >Sony</LinkFormatter>, <LinkFormatter href="brand/hp-laptops-printers-accessories-qatar">HP</LinkFormatter>, <LinkFormatter href="brand/dell-laptops-qatar" >Dell</LinkFormatter>, <LinkFormatter href="brand/huawei" >Huawei</LinkFormatter>, <LinkFormatter href="brand/lenovo-qatar" >Lenovo</LinkFormatter>, <LinkFormatter href="brand/apple" >Apple</LinkFormatter>, and other leading tech giants grace our online store. Explore our <LinkFormatter href="/electronics/home-appliances" >home appliances</LinkFormatter> section, featuring <LinkFormatter href="electronics/home-appliances/washing-machines-dryers">washing machines, dryers</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/air-conditioners">air conditioners</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/sewing-machines">sewing machines</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/vacuum-cleaners">vacuum cleaners</LinkFormatter>, <LinkFormatter href="electronics/home-appliances/pressure-washers">pressure washers</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/heaters">heaters</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/air-purifiers">air purifiers</LinkFormatter>, <LinkFormatter href="/electronics/home-appliances/fans-coolers">fans and coolers</LinkFormatter>,<LinkFormatter href="/electronics/home-appliances/lanterns-flashlights">flashlights</LinkFormatter>. Our <LinkFormatter href="/electronics/kitchen-appliances" >kitchen appliances</LinkFormatter> range encompasses <LinkFormatter href="/electronics/kitchen-appliances/refrigerators" >refrigerators</LinkFormatter>, <LinkFormatter href="#" >cooking ranges</LinkFormatter>, <LinkFormatter href="#" >blenders & mixers</LinkFormatter>, air fryers, rice cookers, microwave ovens, coffee makers, water dispensers, electric kettles, <LinkFormatter href="#" >dishwashers</LinkFormatter>, and more in small appliances.
                            <br />
                            Dive into our <LinkFormatter href="#" >furniture</LinkFormatter> collection, offering <LinkFormatter href="#" >bedroom sets</LinkFormatter>, beds, <LinkFormatter href="#" >Sofas & Couches</LinkFormatter>, chairs, tables, and other home essentials. The home and kitchen department covers everyday must-haves like <LinkFormatter href="#" >food storage</LinkFormatter>, <LinkFormatter href="#" >cookware</LinkFormatter>, <LinkFormatter href="#" >bedding</LinkFormatter>, home improvement supplies, tools, <LinkFormatter href="#" >home decor</LinkFormatter>, <LinkFormatter href="#" >lights & chandeliers</LinkFormatter>, and more. For automotive enthusiasts, our department caters to accessories to keep your car in top-notch condition. In the household and kitchen section, you&apos;ll find a vast range of both branded and non-branded items. Indulge in our beauty store, featuring <LinkFormatter href="#" >hair care</LinkFormatter> and <LinkFormatter href="#" >personal care</LinkFormatter> products, fragrances, <LinkFormatter href="#" >perfumes</LinkFormatter>, <LinkFormatter href="#" >cosmetics</LinkFormatter>, <LinkFormatter href="#" >skincare</LinkFormatter>, grooming products, bath and body items, and more. Premium brands such as <LinkFormatter href="#" >Calvin Klein</LinkFormatter>, <LinkFormatter href="#" >Deborah Milano</LinkFormatter>, <LinkFormatter href="#" >Max Factor</LinkFormatter>, <LinkFormatter href="#" >Maybelline</LinkFormatter>, <LinkFormatter href="#" >Essence</LinkFormatter>, <LinkFormatter href="#" >L&apos;Oreal Paris</LinkFormatter>, and many others adorn our shelves. Revamp your wardrobe by shopping online for a diverse selection of clothing, shoes, and accessories for men, women, and kids. From sportswear and dresses to traditional and ethnic clothing, our women&apos;s fashion department has it all. Men can find fashion, accessories, and footwear, while kids have a dedicated section with clothing, accessories, and shoes for all ages. Little ones are not forgotten, with a range of baby and kids products, including <LinkFormatter href="#" >toys</LinkFormatter>, games, outdoor play equipment, <LinkFormatter href="#" >scooters</LinkFormatter>, and more. Stay active with our vast sporting and outdoor product selection from brands like Muscletech, Skyland, Sparnod Fitness, Everlast, and others. Whether you need fitness equipment, sports nutrition, cycling essentials, or specialized gear for activities like boxing, yoga, or swimming, we&apos;ve taken care of everything. Simplify your online food shopping with Ansar Gallery Grocery, offering fast delivery on fresh fruits, vegetables, pantry items, cooking essentials, household products, cleaning supplies, and more from quality imported brands.
                        </p>
                    </>
                )
            },
            {
                title: "Hassle-Free Qatar Online Shopping",
                content: (
                    <>
                        <p>
                            Experience the assurance of top-notch service every time you make an online purchase at Ansar Gallery. We simplify the online shopping process in Qatar, offering secure options such as online card payment, card on delivery, and cash on delivery to eliminate any hassle. Navigate through our selection effortlessly by shopping based on brands or sub-categories. Utilize our advanced search features to filter products by price and other criteria. Elevate your shopping experience by downloading the Ansar Gallery App, available on the <LinkFormatter href="#" >App Store</LinkFormatter> and <LinkFormatter href="#" >Play Store</LinkFormatter>. This app not only mirrors the features of the Ansar Gallery online store but also provides exclusive discounts, regular deals, and more.
                            <br />
                            Whether you prefer shopping by brand, sub-category, or using advanced search features, Ansar Gallery ensures a seamless and stress-free online shopping experience in Qatar. Bid farewell to crowded malls, long lines, and the stresses of in-store shopping. Enjoy the advantages of shopping from the comfort of your home. To get started, create your account, set your delivery address, and choose your preferred payment option. Explore our departments, add desired products to your cart, and complete the checkout process. We&apos;ll take care of the rest, preparing your order for prompt delivery straight to your door. Sign up for your Ansar Gallery Qatar online shop account now to embark on a delightful shopping journey. Happy shopping!
                        </p>
                    </>
                )
            }
        ];
    }

    return [
        {
            title: "التسوق عبر الإنترنت في قطر",
            content: (
                <>
                    <p>
                        باعتباره المتجر الرائد للتسوق عبر الإنترنت في قطر، يوفر أنصار جاليري قطر مجموعة شاملة من المنتجات، مما يجعله المصدر الأساسي لكل ما تحتاجه. سواء كنت تبحث عن أحدث الإلكترونيات، الهواتف المحمولة، <LinkFormatter href="#" >الأثاث</LinkFormatter>، <LinkFormatter href="#" >السجاد</LinkFormatter>، الكتب، القرطاسية، المعدات الرياضية و<LinkFormatter href="#" >معدات اللياقة البدنية</LinkFormatter>، <LinkFormatter href="#" >مستحضرات التجميل</LinkFormatter>، أو البقالة، فإن متجر أنصار جاليري قطر يغطيك بمجموعة واسعة.
                    </p>

                    <p>
                        نهجنا الذي يركز على العملاء يميزنا، حيث نقدم مجموعة واسعة من المنتجات، تطبيق تسوق سهل الاستخدام، والمزيد لتبسيط تجربة التسوق عبر الإنترنت الخاصة بك. في أنصار جاليري قطر، نحن ملتزمون بتقديم أفضل خدمة ممكنة لعملائنا. نحن نوفر التوصيل لجميع أنحاء قطر، مما يسهل عليك الوصول إلى أقسام السوبر ماركت المتنوعة وخدمة العملاء الاستثنائية. أبعد من كوننا مجرد متجر إلكتروني، نسعى لتجاوز التوقعات من خلال ضمان تجارب تسوق خالية من الإجهاد وتقديم منتجات معروفة بجودتها طويلة الأمد. وفر الوقت والجهد من خلال الاستمتاع بالتسوق الشامل من راحة منزلك. استفد من راحة الشحن المجاني للطلبات التي تتجاوز مبلغاً معيناً عند التسوق معنا عبر الإنترنت.
                    </p>
                </>
            )
        },
        {
            title: "تسوق أفضل المنتجات والعلامات التجارية في أنصار جاليري قطر",
            content: <p>محتوى القسم 2 هنا...</p>
        },
        {
            title: "تسوق إلكتروني خالي من المتاعب في قطر",
            content: <p>محتوى القسم 3 هنا...</p>
        }
    ];
};
