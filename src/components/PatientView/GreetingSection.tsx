export function GreetingSection() {
  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? "Good Morning!"
      : hour < 18
      ? "Good Afternoon!"
      : "Good Evening!"

  return (
    <div>
      <h1 className="text-3xl font-bold">{greeting}</h1>
      <p className="text-muted-foreground">
        Ready to stay on track with your medication?
      </p>
    </div>
  )
}
