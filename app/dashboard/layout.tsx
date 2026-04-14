export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout is a passthrough. Active dashboard shells live in /owner and /professional.
  return <>{children}</>
}
