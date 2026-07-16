import Link from "next/link";
import { navigation } from "@/data/navigation";

export default function DesktopNav() {
  return (
    <nav className="hidden items-center gap-7 lg:flex">
      {navigation.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="flex items-center gap-1.0 text-[16px] font-medium text-gray-200 transition-all duration-200 hover:text-white"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
