import '@/app/ui/global.css';
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="flex justify-center bg-slate-900">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
