"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, UserCheck, UserPlus } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  username: string
  name?: string
  profile_pic?: string
  bio?: string
  isFollowing?: boolean
}

interface LikesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  users: User[]
}

export function LikesDialog({ open, onOpenChange, title, users = [] }: LikesDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [followState, setFollowState] = useState<Record<number, boolean>>(() => {
    const state: Record<number, boolean> = {}
    users.forEach((user) => {
      state[user.id] = user.isFollowing || false
    })
    return state
  })

  const filteredUsers = users.filter(
    (user) =>
      (user.name ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFollow = (userId: number) => {
    setFollowState((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="max-h-[60vh] overflow-y-auto space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <Link href={`/profile/${user.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar>
                    <AvatarImage src={user.profile_pic || "/placeholder.svg"} alt={user.username} />
                    <AvatarFallback>{user.username ? user.username[0].toUpperCase() : "U"}</AvatarFallback>
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
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? `No users found matching "${searchQuery}"` : "No users"}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

