import "./globals.css";

export const metadata = {
  title: "Nyaya - AI Legal Assistance Platform",
  description: "Plain-language legal assistance with explainable AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}