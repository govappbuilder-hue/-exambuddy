import "./globals.css";
import BottomNav from "../components/BottomNav";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata = {
  title: "ExamBuddy - Gujarat Govt Exam | GPSC, PSI, Talati, GSSSB",
  description: "Gujarat government exam preparation. GPSC, PSI, Talati, Bin Sachivalay, GSSSB - Mock tests, Doubt Solver in Gujarati.",
  keywords: "GPSC, PSI, Talati, GSSSB, Gujarat exam, government exam",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}