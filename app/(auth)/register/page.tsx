import { cookies } from "next/headers"

import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"
import type { Metadata } from "next"
import Link from "next/link"
import { authCompletionPath, safeReturnTo } from "@/lib/route-access"

export const metadata: Metadata = { title: "Create Account — HomeFix" }

const Register = async ({
  // @ts-expect-error Server Component
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) => {
  const params = await searchParams
  const next = safeReturnTo(params.next)
  const savedRole = (await cookies()).get("homefix-registration-role")?.value
  const initialRole = savedRole === "technician" ? "technician" : "customer"

  return (
    <AuthShell
      title="Create your account"
      description="Join HomeFix in less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
            className="font-semibold text-forest underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm
        initialRole={initialRole}
        redirectTo={authCompletionPath(next)}
      />
    </AuthShell>
  )
}

export default Register
