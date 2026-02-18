import ReactQueryProvider from "@/providers/react-query-provider"
import { SupabaseProvider } from "@/providers/supabase-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <SupabaseProvider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
