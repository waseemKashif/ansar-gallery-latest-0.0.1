import { APP_NAME } from "@/lib/constants";
import Image from "next/image";
const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className=" border-t relative  bottom-0">
      <div className="p-5 flex-center">
        {currentYear} {APP_NAME}. All Rights Reserved
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 flex-row"
          href="https://ansargallery.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Ansar Gallery
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://play.google.com/store/apps/details?id=com.ahmarkets.ecom"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Goto Application
        </a>
      </div>
    </footer>
  );
};

export default Footer;
