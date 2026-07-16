import './globals.css';

export const metadata = {
  title: 'SecureLens',
  description: 'AI-Powered Security Intelligence Platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="dark">{children}</body>
    </html>
  );
}
