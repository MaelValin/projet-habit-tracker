import '@/app/ui/global.css';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex justify-center ">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
