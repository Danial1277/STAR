import './globals.css';

export const metadata = {
  title: 'Созвездия',
  description: 'Интерактивная энциклопедия звёздного неба',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-[#030712] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}