"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface FollowersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "followers" | "following";
  followers: string[];
  following: string[];
}

interface User {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  isFollowing: boolean
}

export function FollowersDialog({ open, onOpenChange, type, followers, following }: FollowersDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(type)

  const list = activeTab === "followers" ? followers : following;

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {activeTab === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={type} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>


          <TabsContent value="followers" className="max-h-[60vh] overflow-auto">
          {followers.length ? (
            followers.map((username) => (
              <Link key={username} href={`/profile/${username}`} className="block py-2">
                @{username}
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No followers
            </p>
          )}
        </TabsContent>

        <TabsContent value="following" className="max-h-[60vh] overflow-auto">
          {following.length ? (
            following.map((username) => (
              <Link key={username} href={`/profile/${username}`} className="block py-2">
                @{username}
              </Link>
            ))
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No following
            </p>
          )}
        </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

