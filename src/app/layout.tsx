import Navbar from "@/components/Navbar"
import "./globals.css"
import ReactQueryProvider from "@/providers/react-query-provider"
import { SupabaseProvider } from "@/providers/supabase-provider"
import { Toaster } from "sonner"

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
            <Navbar />
            {children}
              <Toaster richColors position="top-right" />
          </ReactQueryProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
