import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import LayoutContainer from "@/components/layout/LayoutContainer";

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
    <html lang="pt-BR">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <LayoutContainer>{children}</LayoutContainer>
      </body>
    </html>
  );
}
