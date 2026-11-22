import { ProfilePage } from "@/components/Dashboard/profile-page"
import type { Metadata } from "next"



export const metadata: Metadata = { title: "Profile — HomeFix Technician" }

const Profile = () => <ProfilePage role="technician" />

export default Profile