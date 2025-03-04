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
  name: string
  username: string
  avatar: string
  isFollowing: boolean
}

interface LikesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  users: User[]
}

export function LikesDialog({ open, onOpenChange, title = "Likes", users }: LikesDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [followState, setFollowState] = useState<Record<number, boolean>>(() => {
    const state: Record<number, boolean> = {}
    users.forEach((user) => {
      state[user.id] = user.isFollowing
    })
    return state
  })

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
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
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 mb-4 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
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
              <div className="text-center py-8 text-muted-foreground">No users found matching "{searchQuery}"</div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

