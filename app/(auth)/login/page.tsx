import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"
import Link from "next/link"
import { authCompletionPath, safeReturnTo } from "@/lib/route-access"

export const metadata: Metadata = { title: "Sign In — HomeFix" }

const Login = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) => {
  const params = await searchParams
  const next = safeReturnTo(params.next)

  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to your dashboard."
      footer={
        <>
          New to HomeFix?{" "}
          <Link
            href={
              next ? `/register?next=${encodeURIComponent(next)}` : "/register"
            }
            className="font-semibold text-forest underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={authCompletionPath(next)} />
    </AuthShell>
  )
}

export default Login
