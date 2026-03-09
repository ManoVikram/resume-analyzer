import "./globals.css";
import { DM_Serif_Display } from "next/font/google";

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
    <html lang="en">
      <body className={`${dmSerifDisplay.variable} antialiased`}>
        <main className="px-6 md:px-12">
          {children}
        </main>
      </body>
    </html>
  );
}
