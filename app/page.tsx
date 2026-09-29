import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center bg-black">
      <Image src="/logo.png" alt="RCW" width={120} height={120} />
      <h1 className="text-4xl font-extrabold tracking-tight">
        <span className="rcw-gradient-text">RCW</span> Quote & Invoice Generator
      </h1>
      <p className="text-gray-400 max-w-md">
        Create a professional quote in minutes and send it straight to your
        client on WhatsApp.
      </p>
      <Link
        href="/quote"
        className="rcw-gradient-bg rcw-glow text-white font-bold px-8 py-4 rounded-full uppercase tracking-wide"
      >
        Create a Quote
      </Link>
    </main>
  );
}
