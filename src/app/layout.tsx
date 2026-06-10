import "./globals.css";
import React from "react";

export const metadata = {
  title: "ExamBuddy - Gujarat Govt Exam Preparation",
  description: "GPSC, GSSSB, Police, SSC exam preparation platform with AI-powered current affairs",
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