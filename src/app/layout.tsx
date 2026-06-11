import "./globals.css";
import React from "react";

export const metadata = {
  title: "ExamBuddy - Gujarat Govt Exam Preparation",
  description: "GPSC, GSSSB, Police, SSC exam preparation platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <body style={{ margin: 0, padding: 0, background: "#030712" }}>
        {children}
      </body>
    </html>
  );
}