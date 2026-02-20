interface GreetingProps {
  userType: "Patient" | "Caretaker"
}

export function GreetingSection({ userType }: GreetingProps) {
  const hour = new Date().getHours()

  const greeting = hour < 12 ? "Good Morning!" : hour < 18 ? "Good Afternoon!" : "Good Evening!"

  const subtitle =
    userType === "Caretaker"
      ? "Keeping an eye on your loved ones' medications today."
      : "Ready to stay on track with your medication?"

  return (
    <div className="flex flex-col space-y-2 rounded-2xl bg-white p-4 shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900">{greeting}</h1>

      <p className="text-sm text-gray-500 md:text-base">{subtitle}</p>
    </div>
  )
}
