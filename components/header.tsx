import { ShoppingBagIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
const Header = () => {
  return (
    <header className="w-full border-b border-gray-300">
      <div className=" max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" title="ansar gallery shopping">
                <Image
                  className="block h-8 w-auto"
                  src="/images/ansarGallerylogo.png"
                  alt="Ansar Gallery Logo"
                  width={200}
                  height={200}
                  priority
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <nav className="flex space-x-4">
              <Link
                href="/catalog"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Catalog
              </Link>

              <Link
                href="/sign-in"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex"
              >
                <UserIcon className="h-5 w-5" /> Sign In
              </Link>
              <Link
                href="/cart"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                Cart
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
