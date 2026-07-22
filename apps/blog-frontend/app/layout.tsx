import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });

export const metadata: Metadata = {
  title: { default: "Jonathan Tissot", template: "%s | Jonathan Tissot" },
  description:
    "Software architect writing about distributed systems, TypeScript, and frontend craft.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        <header className="border-b border-neutral-800">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
            <Link
              href="/"
              className="font-lora text-lg font-semibold tracking-tight text-white hover:text-amber-400 transition-colors"
            >
              Jonathan Tissot
            </Link>
            <ul className="flex gap-6 text-sm text-neutral-400">
              <li>
                <Link
                  href="/"
                  className="hover:text-white transition-colors"
                >
                  Writing
                </Link>
              </li>
              <li>
                <Link
                  href="/posts/new"
                  className="hover:text-white transition-colors"
                >
                  New post
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/jonathantissot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </nav>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>

        <footer className="border-t border-neutral-800 mt-20">
          <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Jonathan Tissot
          </div>
        </footer>
      </body>
    </html>
  );
}
