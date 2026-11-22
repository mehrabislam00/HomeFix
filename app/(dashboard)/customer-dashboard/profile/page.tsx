import { ProfilePage } from "@/components/Dashboard/profile-page"
import type { Metadata } from "next"



export const metadata: Metadata = { title: "Profile — HomeFix" }

const Profile = () => <ProfilePage role="customer" />

export default Profile