import { redirect } from "next/navigation"

/** /admin is a short alias for the protected admin dashboard. */
const Admin = () => {
  redirect("/admin-dashboard")
}

export default Admin
