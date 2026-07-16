import Link from "next/link";
import { Shield } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-4"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/30 bg-violet-600/15 shadow-lg shadow-violet-900/30">
        <Shield className="h-8 w-8 text-violet-400" />
      </div>

      <div className="flex items-center leading-none">
        <span className="text-3xl font-extrabold tracking-tight text-white">
          SecureLens
        </span>
      </div>
    </Link>
  );
}
