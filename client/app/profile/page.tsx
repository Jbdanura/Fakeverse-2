import { Navbar } from "@/components/navbar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default function ProfilePage({ searchParams }: { searchParams: { tab?: string } }) {
  const activeTab = searchParams.tab || "posts"
  const baseUrl = "http://localhost:5000"  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader baseUrl={baseUrl} />
        <ProfileTabs defaultTab={activeTab} />
      </div>
    </div>
  )
}
