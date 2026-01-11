"use client";
import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { usePathname } from "next/navigation";
// Link Arrays
import { informations, payments, services, socials } from "@/database/sample-data";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.includes("/placeorder")) return null;

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
                    {socials.map((social) => (
                      <Link key={social.title} href={social.href} target="_blank" title={social.title}>
                        <Image src={social.iconLink} alt={social.title} width={20} height={20} />
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-2 text-sm">
                    <Link href="https://maps.app.goo.gl/bGuL7JmGq1iMkJ9V8" target="_blank" className="flex items-center gap-2"><MapPin size={16} />  Ansar Gallery</Link>
                    <Link href="tel:+97444486000" target="_blank" className="flex items-center gap-2"><Phone size={14} /> +97444486000</Link>
                    <Link href="mailto:customercare@ansargallery.com" target="_blank" className="flex items-center gap-2"><Mail size={14} /> customercare@ansargallery.com</Link>
                    <Link href="https://api.whatsapp.com/send/?phone=97460094446&text=Hi,%20Can%20you%20assist%20me?&app_absent=0" target="_blank" className="flex items-center gap-2"><Image src="/images/whatsappIcon.svg" alt="whatsapp" width={14} height={14} /> +97460094446</Link>
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
            <AccordionItem value="services" className="border-b border-neutral-700">
              <AccordionTrigger className="text-sm font-semibold">OUR SERVICES</AccordionTrigger>
              <AccordionContent>
                <ul className="mt-3 pl-2 space-y-2 text-sm">
                  {services.map((item) => (
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
              {socials.map((social) => (
                <Link key={social.title} href={social.href} target="_blank" title={social.title}>
                  <Image src={social.iconLink} alt={social.title} width={20} height={20} />
                </Link>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <Link href="https://maps.app.goo.gl/bGuL7JmGq1iMkJ9V8" target="_blank" className="flex items-center gap-2"><MapPin size={18} />  Ansar Gallery</Link>
              <Link href="https://api.whatsapp.com/send/?phone=97460094446&text=Hi,%20Can%20you%20assist%20me?&app_absent=0" target="_blank" className="flex items-center gap-2"><Image src="/images/whatsappIcon.svg" alt="whatsapp" width={14} height={14} /> +97460094446</Link>
              <Link href="tel:+97444486000" target="_blank" className="flex items-center gap-2"><Phone size={14} /> +97444486000</Link>
              <Link href="mailto:customercare@ansargallery.com" target="_blank" className="flex items-center gap-2"><Mail size={14} /> customercare@ansargallery.com</Link>

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
                  <Link href={item.href} className="hover:underline" target={item.href.startsWith("http") ? "_blank" : "_self"}>{item.title}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">PAYMENT & SHIPPING</h3>
            <ul className="space-y-2 text-sm">
              {payments.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:underline" target={item.href.startsWith("http") ? "_blank" : "_self"}>{item.title}</Link>
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
