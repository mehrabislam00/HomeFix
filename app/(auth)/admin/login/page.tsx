import { AdminLoginForm } from "@/components/auth/admin-login-form";
import { AuthShell } from "@/components/auth/auth-shell";
import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "Admin Login — HomeFix",
  robots: { index: false, follow: false },
};

const AdminLogin = () => {
  return (
    <AuthShell
      variant="admin"
      title="Administrator sign in"
      description="Authorized HomeFix administrators only."
    >
      <AdminLoginForm />
    </AuthShell>
  );
};

export default AdminLogin;