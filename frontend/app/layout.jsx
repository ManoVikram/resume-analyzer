import "./globals.css";

export const metadata = {
  title: "Resume Analyzer",
  description: "Analyze resumes against job descriptions and get insights to improve your chances of landing your dream job.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
