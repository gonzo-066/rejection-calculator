import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rejection Cost Calculator | Axarat",
  description:
    "Calculate the true cost of your fresh fruit rejections — powered by Axarat",
  openGraph: {
    title: "Rejection Cost Calculator | Axarat",
    description:
      "Calculate the true cost of your fresh fruit rejections — powered by Axarat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
