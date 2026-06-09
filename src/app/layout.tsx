import "./globals.css";
import React from "react";

export const metadata = {
  title: "Quiz App",
  description: "Practice for Exams",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="gu">
      <body>
        {children}
      </body>
    </html>
  );
}