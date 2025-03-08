"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function NotificationSettings() {
  const [pushNotifications, setPushNotifications] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    directMessages: true,
    newFollowerPosts: false,
  })

  const [emailNotifications, setEmailNotifications] = useState({
    likes: false,
    comments: true,
    follows: true,
    mentions: false,
    directMessages: true,
    newFollowerPosts: false,
    newsletter: true,
    accountUpdates: true,
  })

  const handlePushChange = (name: string) => {
    setPushNotifications((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }))
  }

  const handleEmailChange = (name: string) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    console.log("Updated notification settings:", { pushNotifications, emailNotifications })
    alert("Notification settings updated successfully!")
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Control how and when you receive notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="push">
            <TabsList className="mb-4">
              <TabsTrigger value="push">Push Notifications</TabsTrigger>
              <TabsTrigger value="email">Email Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="push" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-likes">Likes</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when someone likes your posts.</p>
                </div>
                <Switch
                  id="push-likes"
                  checked={pushNotifications.likes}
                  onCheckedChange={() => handlePushChange("likes")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-comments">Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when someone comments on your posts.
                  </p>
                </div>
                <Switch
                  id="push-comments"
                  checked={pushNotifications.comments}
                  onCheckedChange={() => handlePushChange("comments")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-follows">Follows</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when someone follows you.</p>
                </div>
                <Switch
                  id="push-follows"
                  checked={pushNotifications.follows}
                  onCheckedChange={() => handlePushChange("follows")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-mentions">Mentions</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications when someone mentions you.</p>
                </div>
                <Switch
                  id="push-mentions"
                  checked={pushNotifications.mentions}
                  onCheckedChange={() => handlePushChange("mentions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-messages">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for new direct messages.</p>
                </div>
                <Switch
                  id="push-messages"
                  checked={pushNotifications.directMessages}
                  onCheckedChange={() => handlePushChange("directMessages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-follower-posts">New Follower Posts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when people you follow post new content.
                  </p>
                </div>
                <Switch
                  id="push-follower-posts"
                  checked={pushNotifications.newFollowerPosts}
                  onCheckedChange={() => handlePushChange("newFollowerPosts")}
                />
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-likes">Likes</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when someone likes your posts.
                  </p>
                </div>
                <Switch
                  id="email-likes"
                  checked={emailNotifications.likes}
                  onCheckedChange={() => handleEmailChange("likes")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-comments">Comments</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when someone comments on your posts.
                  </p>
                </div>
                <Switch
                  id="email-comments"
                  checked={emailNotifications.comments}
                  onCheckedChange={() => handleEmailChange("comments")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-follows">Follows</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications when someone follows you.</p>
                </div>
                <Switch
                  id="email-follows"
                  checked={emailNotifications.follows}
                  onCheckedChange={() => handleEmailChange("follows")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-mentions">Mentions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications when someone mentions you.
                  </p>
                </div>
                <Switch
                  id="email-mentions"
                  checked={emailNotifications.mentions}
                  onCheckedChange={() => handleEmailChange("mentions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-messages">Direct Messages</Label>
                  <p className="text-sm text-muted-foreground">Receive email notifications for new direct messages.</p>
                </div>
                <Switch
                  id="email-messages"
                  checked={emailNotifications.directMessages}
                  onCheckedChange={() => handleEmailChange("directMessages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-newsletter">Newsletter</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive our weekly newsletter with platform updates and featured content.
                  </p>
                </div>
                <Switch
                  id="email-newsletter"
                  checked={emailNotifications.newsletter}
                  onCheckedChange={() => handleEmailChange("newsletter")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-account">Account Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates about your account and security.
                  </p>
                </div>
                <Switch
                  id="email-account"
                  checked={emailNotifications.accountUpdates}
                  onCheckedChange={() => handleEmailChange("accountUpdates")}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  )
}

