"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"

interface settingProps{
  baseUrl:string
}

export function SettingsTabs({baseUrl}:settingProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-2 w-full">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings baseUrl={baseUrl}/>
      </TabsContent>
      <TabsContent value="account" className="mt-6">
        <AccountSettings baseUrl={baseUrl}  />
      </TabsContent>
    </Tabs>
  )
}

