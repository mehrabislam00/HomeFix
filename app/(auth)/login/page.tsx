import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import Link from "next/link";



export const metadata: Metadata = { title: "Sign In — HomeFix" };

const Login = () => {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue to your dashboard."
      footer={
        <>
          New to HomeFix?{" "}
          <Link href="/register" className="font-semibold text-forest underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
};

export default Login;