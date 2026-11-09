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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
