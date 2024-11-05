import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/txn7htm.css" />
      </head>
      <body>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
