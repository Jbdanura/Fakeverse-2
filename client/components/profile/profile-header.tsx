"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, LinkIcon, MapPin, MessageSquare, MoreHorizontal, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FollowersDialog } from "@/components/profile/followers-dialog"
import { users } from "@/lib/api"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { auth } from "@/lib/api"

export function ProfileHeader() {
  const params = useParams()
  const router = useRouter()
  const username = typeof params?.username === 'string' ? params.username : undefined
  const { user: authUser, refreshUser } = useAuth()

  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"followers" | "following">("followers")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // If we're viewing current user profile, try to refresh token first
        if (!username || username === 'me') {
          try {
            // Try to refresh the token silently
            await auth.refreshToken()
            await refreshUser() // Use the auth context's refreshUser method
          } catch (refreshErr) {
            console.warn('Token refresh failed, continuing with current token:', refreshErr)
          }
        }
        
        // If we're viewing the current user's profile, start with authUser data
        if (!username || username === 'me') {
          setUser(authUser) // Start with auth context data while loading
        }
        
        try {
          // Try to fetch updated profile data
          const profileData = await users.getProfile(username || 'me')
          setUser(profileData)
        } catch (err) {
          console.error('Failed to fetch profile:', err)
          
          // For current user, if API call fails, keep using auth context data
          if ((!username || username === 'me') && authUser) {
            console.log('Using auth context user data as fallback')
            // Don't set error if we have fallback data
          } else {
            setError('Failed to load profile')
          }
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [username, authUser])

  const toggleFollow = () => {
    if (!user) {
      toast.error('Please log in to follow users')
      return
    }
    setIsFollowing(!isFollowing)
  }

  const openFollowersDialog = () => {
    setDialogType("followers")
    setShowFollowersDialog(true)
  }

  const openFollowingDialog = () => {
    setDialogType("following")
    setShowFollowersDialog(true)
  }

  // Show loading state
  if (loading && !user) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    )
  }

  // Show error state only if we have no user data at all
  if (error && !user) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="text-lg font-medium mb-2">Could not load profile</div>
        <div className="text-sm text-muted-foreground mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  // Format joined date
  const joinedDate = user.created_at 
    ? `Joined ${new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    : '';

  // Inside the render section, for handling the case where we need a placeholder
  if (!user && !loading && !error) {
    // Show a placeholder profile for unauthenticated users
    return (
      <div className="mb-6">
        {/* Cover Photo */}
        <div className="relative w-full h-[200px] md:h-[300px] rounded-t-xl overflow-hidden">
          <Image 
            src="/placeholder.svg?height=400&width=1200" 
            alt="Cover photo" 
            fill 
            className="object-cover" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="relative px-4 pb-4 -mt-16 md:-mt-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="mt-2 md:mt-0 md:mb-2">
              <h1 className="text-2xl font-bold">Guest View</h1>
              <p className="text-muted-foreground">Log in to see your profile</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button onClick={() => router.push('/login')}>
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Cover Photo */}
      <div className="relative w-full h-[200px] md:h-[300px] rounded-t-xl overflow-hidden">
        <Image 
          src={user.cover_pic || "/placeholder.svg?height=400&width=1200"} 
          alt="Cover photo" 
          fill 
          className="object-cover" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.profile_pic || "/placeholder.svg"} alt={user.username} />
              <AvatarFallback>
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="mt-2 md:mt-0 md:mb-2">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="h-9">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="sm" className="h-9" variant={isFollowing ? "outline" : "default"} onClick={toggleFollow}>
              {isFollowing ? (
                "Following"
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Share profile</DropdownMenuItem>
                <DropdownMenuItem>Block user</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Report profile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-4 max-w-2xl">
          <p>{user.bio || ""}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </div>
            )}
            {user.website && (
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-1" />
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            {joinedDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {joinedDate}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div>
            <span className="font-bold">{user.post_count || 0}</span> <span className="text-muted-foreground">Posts</span>
          </div>
          <button onClick={openFollowersDialog} className="hover:underline">
            <span className="font-bold">{user.follower_count || 0}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </button>
          <button onClick={openFollowingDialog} className="hover:underline">
            <span className="font-bold">{user.following_count || 0}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </button>
        </div>
      </div>

      {/* Followers/Following Dialog */}
      <FollowersDialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog} type={dialogType} />
    </div>
  )
}

