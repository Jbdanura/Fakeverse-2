"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search, UserCheck, UserPlus, Loader2 } from "lucide-react"
import Link from "next/link"
import { users } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"

interface User {
  id: number
  username: string
  name?: string
  profile_pic?: string
  bio?: string
  is_following?: boolean
  is_current_user?: boolean
}

interface LikesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  users: User[]
  loading?: boolean
}

export function LikesDialog({ open, onOpenChange, title, users = [], loading = false }: LikesDialogProps) {
  const { user: authUser } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [followState, setFollowState] = useState<Record<number, boolean>>({})
  const [followLoading, setFollowLoading] = useState<Record<number, boolean>>({})
  
  // Reset search when dialog opens or closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])
  
  // Update followState when users change
  useEffect(() => {
    const newFollowState: Record<number, boolean> = {}
    const newFollowLoading: Record<number, boolean> = {}
    
    users.forEach(user => {
      newFollowState[user.id] = user.is_following || false
      newFollowLoading[user.id] = false
    })
    
    setFollowState(newFollowState)
    setFollowLoading(newFollowLoading)
  }, [users])

  // Filter users for display
  const filteredUsers = users.filter(
    (user) => (
      // Filter by search query
      (user.name ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  // Get other users (not the current user)
  const otherUsers = filteredUsers.filter(user => 
    !user.is_current_user && (!authUser || user.id !== authUser.id)
  )

  // Check if current user liked the post
  const currentUserLiked = users.some(user => 
    user.is_current_user || (authUser && user.id === authUser.id)
  )

  const toggleFollow = async (userId: number) => {
    if (!authUser) {
      toast.error("Please login to follow users")
      return
    }
    
    // Prevent multiple clicks
    if (followLoading[userId]) return
    
    try {
      // Set loading state for this user
      setFollowLoading(prev => ({
        ...prev,
        [userId]: true
      }))
      
      // Optimistically update UI
      const newFollowState = !followState[userId]
      setFollowState(prev => ({
        ...prev,
        [userId]: newFollowState
      }))
      
      // Make API call
      if (newFollowState) {
        await users.followUser(userId.toString())
      } else {
        await users.unfollowUser(userId.toString())
      }
    } catch (error) {
      console.error("Failed to update follow status:", error)
      
      // Revert on error
      setFollowState(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }))
      
      toast.error("Failed to update follow status")
    } finally {
      // Clear loading state
      setFollowLoading(prev => ({
        ...prev,
        [userId]: false
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Users who liked this post
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading likes...</p>
          </div>
        ) : (
          <>
            {users.length > 0 && (
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
            )}
            
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {otherUsers.length > 0 ? (
                otherUsers.map((user) => (
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
                      disabled={followLoading[user.id]}
                    >
                      {followLoading[user.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : followState[user.id] ? (
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
                  {users.length === 0 ? (
                    "No one has liked this post yet"
                  ) : currentUserLiked && searchQuery.length === 0 ? (
                    "You're the only one who liked this post"
                  ) : searchQuery.length > 0 ? (
                    `No users found matching "${searchQuery}"`
                  ) : (
                    "No other users have liked this post"
                  )}
                </div>
              )}
              
              {/* Show current user separately if they liked the post */}
              {currentUserLiked && authUser && !searchQuery && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center">
                    <Avatar>
                      <AvatarImage src={authUser.profile_pic || "/placeholder.svg"} alt={authUser.username} />
                      <AvatarFallback>{authUser.username ? authUser.username[0].toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <div className="font-medium">{authUser.name || authUser.username}</div>
                      <div className="text-sm text-muted-foreground">@{authUser.username}</div>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground font-medium">
                      You
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

