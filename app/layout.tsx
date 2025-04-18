import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
 
import { Providers } from "./providers";
 
export const metadata: Metadata = {
  title: "Smart Wallet App",
  description: "Smart Wallet Next.js integration",
};
 
export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
} 