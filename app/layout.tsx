import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Funnel Scenario Planner",
  description: "No-login funnel scenario planning for consultants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
