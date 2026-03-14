import "./globals.css";
import { DM_Serif_Display, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Navbar from "@/components/shared/Navbar";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-dm-serif-display",
})

export const metadata = {
  title: "Resume Analyzer",
  description: "Analyze resumes against job descriptions and get insights to improve your chances of landing your dream job.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${dmSerifDisplay.variable} antialiased`}>
        <Navbar />

        <main className="px-6 md:px-12">
          {children}
        </main>

        <Toaster richColors />
      </body>
    </html>
  );
}
