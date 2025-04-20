"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePosts } from "@/components/profile/profile-posts"

interface ProfileTabsProps {
  baseUrl: string,
  defaultTab?: string
  username: string;
}

export function ProfileTabs({ baseUrl, username,defaultTab = "posts" }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`/profile?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab")
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [searchParams, activeTab])

  return (
    <Tabs defaultValue={activeTab} value={activeTab} className="w-full" onValueChange={handleTabChange}>

      <TabsContent value="posts" className="mt-6">
         <ProfilePosts baseUrl={baseUrl} username={username}/>
       </TabsContent>
    </Tabs>
  )
}

