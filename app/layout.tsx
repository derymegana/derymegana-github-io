import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DERY AI - Ultimate Image Generator",
  description: "DERY AI Generator powered by Secure Pollinations API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body data-theme="dark">
        {children}
      </body>
    </html>
  );
}
