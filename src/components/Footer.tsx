"use client"

import { useRouter } from "next/navigation"

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="bg-slate-100 border-t border-slate-200 ">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">
        
        <div>
          <h2
            className="text-xl font-semibold text-teal-700 cursor-pointer"
            onClick={() => router.push("/")}
          >
            MedsBuddy
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Helping families care for the people they love.  
            Stay informed. Stay worry-free.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li
              className="hover:text-teal-700 cursor-pointer"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className="hover:text-teal-700 cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Login
            </li>
            <li
              className="hover:text-teal-700 cursor-pointer"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MedsBuddy. Because every dose matters.
      </div>
    </footer>
  )
}