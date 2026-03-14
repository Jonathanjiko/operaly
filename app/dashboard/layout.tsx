export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout is a passthrough - actual dashboard layouts are in /business and /professional
  return <>{children}</>
}
