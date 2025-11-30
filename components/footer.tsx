import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// Link Arrays
const informations = [
  { title: "F.A.Q's", href: "/faqs" },
  { title: "About Us", href: "/about" },
  { title: "Delivery Information", href: "/delivery-information" },
];

const services = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms & Conditions", href: "/terms" },
  { title: "Contact Us", href: "/contact" },
  { title: "Orders and Returns", href: "/orders-returns" },
  { title: "Brands", href: "/brands" },
];

const payments = [
  { title: "Payment Methods", href: "/payment-methods" },
  { title: "Shipping Guide", href: "/shipping-guide" },
  { title: "Return Policy", href: "/return-policy" },
];

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 text-neutral-200  border-t border-neutral-800">
      <div className="max-w-[1600px] mx-auto py-4 px-2 md:px-4">

        {/* MOBILE/TABLET ACCORDION */}
        <div className="lg:hidden">
          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem value="connect" className="border-b border-neutral-700">
              <AccordionTrigger className="text-sm font-semibold">CONNECT WITH US</AccordionTrigger>
              <AccordionContent>
                <div className="mt-3 pl-2">
                  <div className="flex items-center gap-4 mb-4 text-xl">
                    <i className="fab fa-facebook"></i>
                    <i className="fab fa-tiktok"></i>
                    <i className="fab fa-whatsapp"></i>
                    <i className="fab fa-instagram"></i>
                    <i className="fab fa-snapchat"></i>
                    <i className="fab fa-x-twitter"></i>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>Ansar Gallery</p>
                    <p className="flex items-center gap-2"><Phone size={14} /> +97444486000</p>
                    <p className="flex items-center gap-2"><Mail size={14} /> customercare@ansargallery.com</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="info" className="border-b border-neutral-700">
              <AccordionTrigger className="text-sm font-semibold">INFORMATIONS</AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 pl-2 space-y-2 text-sm">
                  {informations.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:underline">{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>


            <AccordionItem value="payment" className="border-b border-neutral-700">
              <AccordionTrigger className="text-sm font-semibold">PAYMENT & SHIPPING</AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 pl-2 space-y-2 text-sm">
                  {payments.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="hover:underline">{item.title}</Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>


          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">NEWSLETTER</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" className="bg-neutral-800 border-neutral-700" />
              <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>
          </div>
          <div className="mt-6 w-32 h-12 bg-neutral-800 rounded flex items-center justify-center text-xs">
            CERTIFIED BY THEQA
          </div>
        </div>

        {/* DESKTOP GRID (4 COLUMNS) */}
        <div className="hidden lg:grid grid-cols-5 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-4">CONNECT WITH US</h3>
            <div className="flex items-center gap-4 mb-4 text-xl">
              <i className="fab fa-facebook"></i>
              <i className="fab fa-tiktok"></i>
              <i className="fab fa-whatsapp"></i>
              <i className="fab fa-instagram"></i>
              <i className="fab fa-snapchat"></i>
              <i className="fab fa-x-twitter"></i>
            </div>
            <div className="space-y-2 text-sm">
              <p>Ansar Gallery</p>
              <p className="flex items-center gap-2"><Phone size={14} /> +97444486000</p>
              <p className="flex items-center gap-2"><Mail size={14} /> customercare@ansargallery.com</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">INFORMATIONS</h3>
            <ul className="space-y-2 text-sm">
              {informations.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline">{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">OUR SERVICES</h3>
            <ul className="space-y-2 text-sm">
              {services.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline">{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">PAYMENT & SHIPPING</h3>
            <ul className="space-y-2 text-sm">
              {payments.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline">{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">NEWSLETTER</h3>
            <div className="flex gap-2">
              <Input placeholder="Enter your email" className="bg-neutral-800 border-neutral-700" />
              <Button className="bg-blue-600 hover:bg-blue-700">Subscribe</Button>
            </div>

            <div className="mt-6 w-32 h-12 bg-neutral-800 rounded flex items-center justify-center text-xs">
              CERTIFIED BY THEQA
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-xs mt-10 text-neutral-500">© 2025 Ansar Gallery. All rights reserved.</div>
    </footer>
  );
}
