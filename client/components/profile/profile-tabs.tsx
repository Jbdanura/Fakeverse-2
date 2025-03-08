"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePosts } from "@/components/profile/profile-posts"
import { ProfileAbout } from "@/components/profile/profile-about"
import { ProfileFriends } from "@/components/profile/profile-friends"
import { ProfilePhotos } from "@/components/profile/profile-photos"
import { ProfileSaved } from "@/components/profile/profile-saved"

interface ProfileTabsProps {
  defaultTab?: string
}

export function ProfileTabs({ defaultTab = "posts" }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update the URL with the new tab
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`/profile?${params.toString()}`, { scroll: false })
  }

  // Sync with URL parameters if they change externally
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

  return (
    <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={handleTabChange}>
      <TabsList className="grid grid-cols-5 w-full max-w-3xl">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="friends">Friends</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6">
        <ProfilePosts />
      </TabsContent>
      <TabsContent value="photos" className="mt-6">
        <ProfilePhotos />
      </TabsContent>
      <TabsContent value="about" className="mt-6">
        <ProfileAbout />
      </TabsContent>
      <TabsContent value="friends" className="mt-6">
        <ProfileFriends />
      </TabsContent>
      <TabsContent value="saved" className="mt-6">
        <ProfileSaved />
      </TabsContent>
    </Tabs>
  )
}

