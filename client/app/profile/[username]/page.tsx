import { Navbar } from "@/components/navbar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"

export default function ProfilePage({ 
  params, 
  searchParams 
}: { 
  params: { username: string }, 
  searchParams: { tab?: string } 
}) {
  // Get the active tab from URL query parameters
  const activeTab = searchParams.tab || "posts"

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader />
        <ProfileTabs defaultTab={activeTab} />
      </div>
    </div>
  )
} 