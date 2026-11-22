import { cookies } from "next/headers";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";
import Link from "next/link";



export const metadata: Metadata = { title: "Create Account — HomeFix" };

const Register = async () => {
  const savedRole = (await cookies()).get("homefix-registration-role")?.value;
  const initialRole = savedRole === "technician" ? "technician" : "customer";

  return (
    <AuthShell
      title="Create your account"
      description="Join HomeFix in less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-forest underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm initialRole={initialRole} />
    </AuthShell>
  );
};

export default Register;