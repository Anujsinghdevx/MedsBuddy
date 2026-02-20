"use client"

import { useRouter } from "next/navigation"

export default function Footer() {
  const router = useRouter()

  return (
    <footer className="border-t border-slate-200 bg-slate-100 ">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <h2
            className="cursor-pointer text-xl font-semibold text-teal-700"
            onClick={() => router.push("/")}
          >
            MedsBuddy
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Helping families care for the people they love. Stay informed. Stay worry-free.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-slate-800">Quick Links</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li
              className="cursor-pointer hover:text-teal-700"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className="cursor-pointer hover:text-teal-700"
              onClick={() => router.push("/login")}
            >
              Login
            </li>
            <li
              className="cursor-pointer hover:text-teal-700"
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
