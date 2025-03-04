"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { PrivacySettings } from "@/components/settings/privacy-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="privacy">Privacy</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="account" className="mt-6">
        <AccountSettings />
      </TabsContent>
      <TabsContent value="privacy" className="mt-6">
        <PrivacySettings />
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        <NotificationSettings />
      </TabsContent>
      <TabsContent value="appearance" className="mt-6">
        <AppearanceSettings />
      </TabsContent>
    </Tabs>
  )
}

