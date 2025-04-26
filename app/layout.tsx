import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
 
import { Providers } from "./providers";
 
export const metadata: Metadata = {
  title: "AI Twin",
  description: "Create your own AI twin",
  icons: {
    icon: "/favicon.ico"
  }
};
 
export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full bg-gray-900">
      <body className="h-full">
        <Providers>{props.children}</Providers>
      </body>
    </html>
  );
} 