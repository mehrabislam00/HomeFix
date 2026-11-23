import { AdminLoginForm } from "@/components/auth/admin-login-form"
import { AuthShell } from "@/components/auth/auth-shell"
import type { Metadata } from "next"
import { authCompletionPath, safeReturnTo } from "@/lib/route-access"

export const metadata: Metadata = {
  title: "Admin Login — HomeFix",
  robots: { index: false, follow: false },
}

const AdminLogin = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) => {
  const params = await searchParams
  const next = safeReturnTo(params.next)

  return (
    <AuthShell
      variant="admin"
      title="Administrator sign in"
      description="Authorized HomeFix administrators only."
    >
      <AdminLoginForm redirectTo={authCompletionPath(next)} />
    </AuthShell>
  )
}

export default AdminLogin
