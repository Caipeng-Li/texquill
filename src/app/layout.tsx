import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeXquill",
  description: "Paper-ready tables for shared experiment results.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
