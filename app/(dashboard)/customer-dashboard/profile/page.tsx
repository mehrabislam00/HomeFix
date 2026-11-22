import type { Metadata } from "next"

import { ProfilePage } from "@/components/Dashboard/profile-page"

export const metadata: Metadata = { title: "Profile — HomeFix" }

const Profile = () => <ProfilePage role="customer" />

export default Profile