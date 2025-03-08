"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function PrivacySettings() {
  const [privacySettings, setPrivacySettings] = useState({
    accountPrivacy: "public",
    showOnlineStatus: true,
    allowTagging: true,
    allowMentions: true,
    showReadReceipts: true,
    allowDirectMessages: "everyone",
  })

  const handleSwitchChange = (name: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    console.log("Updated privacy settings:", privacySettings)
    alert("Privacy settings updated successfully!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control who can see your content and how your account interacts with others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Account Privacy</h3>
            <RadioGroup
              value={privacySettings.accountPrivacy}
              onValueChange={(value) => handleRadioChange("accountPrivacy", value)}
            >
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="public" id="public" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="public" className="font-medium">
                    Public Account
                  </Label>
                  <p className="text-sm text-muted-foreground">Anyone can see your profile and posts.</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <RadioGroupItem value="private" id="private" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="private" className="font-medium">
                    Private Account
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Only approved followers can see your profile and posts.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Interactions</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-online">Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you're active on the platform.</p>
              </div>
              <Switch
                id="show-online"
                checked={privacySettings.showOnlineStatus}
                onCheckedChange={() => handleSwitchChange("showOnlineStatus")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-tagging">Allow Tagging</Label>
                <p className="text-sm text-muted-foreground">Let others tag you in their posts and photos.</p>
              </div>
              <Switch
                id="allow-tagging"
                checked={privacySettings.allowTagging}
                onCheckedChange={() => handleSwitchChange("allowTagging")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-mentions">Allow Mentions</Label>
                <p className="text-sm text-muted-foreground">Let others mention you in their posts and comments.</p>
              </div>
              <Switch
                id="allow-mentions"
                checked={privacySettings.allowMentions}
                onCheckedChange={() => handleSwitchChange("allowMentions")}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Messages</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="read-receipts">Show Read Receipts</Label>
                <p className="text-sm text-muted-foreground">Let others know when you've read their messages.</p>
              </div>
              <Switch
                id="read-receipts"
                checked={privacySettings.showReadReceipts}
                onCheckedChange={() => handleSwitchChange("showReadReceipts")}
              />
            </div>

            <div className="space-y-2">
              <Label>Who can send you direct messages</Label>
              <RadioGroup
                value={privacySettings.allowDirectMessages}
                onValueChange={(value) => handleRadioChange("allowDirectMessages", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="everyone" id="everyone" />
                  <Label htmlFor="everyone">Everyone</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followers" id="followers" />
                  <Label htmlFor="followers">Followers only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nobody" id="nobody" />
                  <Label htmlFor="nobody">Nobody</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

