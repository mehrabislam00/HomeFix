import { redirect } from "next/navigation";

/** /admin has no landing page of its own — send visitors to the admin login. */
const Admin = () => {
  redirect("/admin/login");
};

export default Admin;