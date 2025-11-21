import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Assistente Financeiro IA",
  description:
    "Seu assistente pessoal para gestão financeira com inteligência artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className=" h-full">
      <body
        className={`h-full font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
