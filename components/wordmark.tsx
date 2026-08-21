import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      {/* native img: Next Image does not optimize SVG */}
      <img src="/logo.svg" alt="Onred" width={132} height={32} className="h-8 w-auto" />
    </Link>
  );
}
