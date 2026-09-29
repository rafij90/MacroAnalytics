import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MacroAnalytics — Economic data, made clear",
  description: "Explore trusted macroeconomic indicators with transparent sources.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}