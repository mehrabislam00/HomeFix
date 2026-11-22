import type { Metadata } from "next"

import { ProfilePage } from "@/components/Dashboard/profile-page"

export const metadata: Metadata = { title: "Profile — HomeFix Technician" }

const Profile = () => <ProfilePage role="technician" />

export default Profile