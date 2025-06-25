'use client'

import { Navbar } from "@/components/navbar"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { useParams } from 'next/navigation';


export default function ProfilePage({ searchParams }: { searchParams: { tab?: string } }) {
  const activeTab = "posts"
  /*const baseUrl = "http://localhost:5000"*/
  const baseUrl = "https://fakeverse-2.onrender.com"

  const params = useParams();
  const username = Array.isArray(params.username)
    ? params.username[0]
    : params.username || "";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar baseUrl={baseUrl} />
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader username={username} baseUrl={baseUrl} />
        <ProfileTabs  baseUrl={baseUrl} username={username} defaultTab={activeTab} />
      </div>
    </div>
  )
}
