"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserCheck, UserPlus } from "lucide-react"
import Link from "next/link"

interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "followers" | "following"
}

interface User {
  id: number
  name: string
  username: string
  avatar: string
  bio: string
  isFollowing: boolean
}

export function FollowersDialog({ open, onOpenChange, type }: FollowersDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(type)
  const [searchQuery, setSearchQuery] = useState("")

  // Sample followers data
  const followers: User[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      bio: "Photographer and digital artist",
      isFollowing: true,
    },
    {
      id: 2,
      name: "Mike Peters",
      username: "mikepeters",
      avatar: "/placeholder.svg?height=100&width=100&text=MP",
      bio: "Software engineer | Coffee enthusiast",
      isFollowing: false,
    },
    {
      id: 3,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=100&width=100&text=EW",
      bio: "Travel blogger exploring the world",
      isFollowing: true,
    },
    {
      id: 4,
      name: "Alex Morgan",
      username: "alexm",
      avatar: "/placeholder.svg?height=100&width=100&text=AM",
      bio: "Sports fan and fitness coach",
      isFollowing: false,
    },
    {
      id: 5,
      name: "Taylor Swift",
      username: "tswift",
      avatar: "/placeholder.svg?height=100&width=100&text=TS",
      bio: "Music lover and aspiring songwriter",
      isFollowing: true,
    },
    {
      id: 6,
      name: "Chris Evans",
      username: "chrise",
      avatar: "/placeholder.svg?height=100&width=100&text=CE",
      bio: "Actor and film enthusiast",
      isFollowing: false,
    },
    {
      id: 7,
      name: "Jessica Alba",
      username: "jessicaa",
      avatar: "/placeholder.svg?height=100&width=100&text=JA",
      bio: "Entrepreneur and wellness advocate",
      isFollowing: true,
    },
  ]

  // Sample following data
  const following: User[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      bio: "Photographer and digital artist",
      isFollowing: true,
    },
    {
      id: 3,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=100&width=100&text=EW",
      bio: "Travel blogger exploring the world",
      isFollowing: true,
    },
    {
      id: 5,
      name: "Taylor Swift",
      username: "tswift",
      avatar: "/placeholder.svg?height=100&width=100&text=TS",
      bio: "Music lover and aspiring songwriter",
      isFollowing: true,
    },
    {
      id: 7,
      name: "Jessica Alba",
      username: "jessicaa",
      avatar: "/placeholder.svg?height=100&width=100&text=JA",
      bio: "Entrepreneur and wellness advocate",
      isFollowing: true,
    },
    {
      id: 8,
      name: "Ryan Reynolds",
      username: "ryanr",
      avatar: "/placeholder.svg?height=100&width=100&text=RR",
      bio: "Actor and entrepreneur with a sense of humor",
      isFollowing: true,
    },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const filteredFollowers = followers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredFollowing = following.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const [followState, setFollowState] = useState<Record<number, boolean>>(() => {
    const state: Record<number, boolean> = {}
    followers.forEach((user) => {
      state[user.id] = user.isFollowing
    })
    following.forEach((user) => {
      state[user.id] = user.isFollowing
    })
    return state
  })

  const toggleFollow = (userId: number) => {
    setFollowState((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
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

          <div className="mt-4 mb-4 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${activeTab}...`}
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsContent value="followers" className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {filteredFollowers.length > 0 ? (
                filteredFollowers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                      </div>
                    </Link>
                    <Button
                      variant={followState[user.id] ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleFollow(user.id)}
                    >
                      {followState[user.id] ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No followers found matching "{searchQuery}"
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              {filteredFollowing.length > 0 ? (
                filteredFollowing.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{user.name}</div>
                        <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                      </div>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => toggleFollow(user.id)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Following
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No following found matching "{searchQuery}"
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

