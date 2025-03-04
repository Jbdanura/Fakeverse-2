"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, UserCheck, UserPlus } from "lucide-react"
import Link from "next/link"
import { users } from "@/lib/api"

interface FollowersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "followers" | "following"
  username?: string
}

interface User {
  id: number
  name: string
  username: string
  profile_pic: string
  bio: string
  is_following: boolean
}

export function FollowersDialog({ open, onOpenChange, type, username = 'me' }: FollowersDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(type)
  const [searchQuery, setSearchQuery] = useState("")
  const [followers, setFollowers] = useState<User[]>([])
  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [followState, setFollowState] = useState<Record<number, boolean>>({})

  // Fetch followers and following data
  useEffect(() => {
    if (open) {
      // Temporary solution until the endpoints are implemented
      // This simulates an API response but clearly marks it as mock data
      setFollowers([
        {
          id: 1,
          username: "mockuser1",
          profile_pic: "/placeholder.svg?height=100&width=100&text=MU",
          bio: "[Mock Data] Photographer and digital artist",
          is_following: false
        },
        {
          id: 2,
          username: "mockuser2", 
          profile_pic: "/placeholder.svg?height=100&width=100&text=MU",
          bio: "[Mock Data] Software engineer",
          is_following: true
        }
      ]);
      
      setFollowing([
        {
          id: 2,
          username: "mockuser2",
          profile_pic: "/placeholder.svg?height=100&width=100&text=MU",
          bio: "[Mock Data] Software engineer",
          is_following: true
        }
      ]);
      
      // Initialize follow state
      setFollowState({
        1: false,
        2: true
      });
      
      setLoading(false);
    }
  }, [open, username, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredFollowers = followers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredFollowing = following.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleFollow = async (userId: number) => {
    try {
      if (followState[userId]) {
        await users.unfollowUser(userId.toString());
      } else {
        await users.followUser(userId.toString());
      }
      
      setFollowState((prev) => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    } catch (error) {
      console.error("Failed to follow/unfollow user", error);
    }
  };

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

          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <>
              <TabsContent value="followers" className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {filteredFollowers.length > 0 ? (
                    filteredFollowers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar>
                            <AvatarImage src={user.profile_pic} alt={user.name} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name || user.username}</div>
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
                      {searchQuery ? `No followers found matching "${searchQuery}"` : "No followers yet"}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="following" className="max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {filteredFollowing.length > 0 ? (
                    filteredFollowing.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar>
                            <AvatarImage src={user.profile_pic} alt={user.name} />
                            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name || user.username}</div>
                            <div className="text-sm text-muted-foreground truncate">@{user.username}</div>
                          </div>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFollow(user.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? `No following found matching "${searchQuery}"` : "Not following anyone yet"}
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

