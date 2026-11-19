import Link from "next/link";
import { SockMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="wrap flex flex-col items-start gap-6 py-20 lg:py-28">
      <SockMark className="h-20 w-auto" />
      <h1 className="display-xl">Deze pagina bestaat niet.</h1>
      <p className="max-w-[48ch] text-lg">
        Misschien is de link oud, of is het product uitverkocht en van de site gehaald.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/shop" className="btn-primary">Naar de shop</Link>
        <Link href="/" className="btn-outline">Naar de homepage</Link>
      </div>
    </div>
  );
}
