"use client"

import { useState, useEffect } from "react"
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
import { toast } from "sonner"

export function ProfileHeader() {
  const params = useParams()
  const router = useRouter()
  const username = typeof params?.username === 'string' ? params.username : undefined

  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"followers" | "following">("followers")
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // If no username provided and user is not authenticated, show error
        if (!username && !isAuthenticated) {
          setError('Please log in to view your profile')
          return
        }
        
        // If username is provided in route, fetch that user, otherwise fetch current user
        if (username === 'me' && !isAuthenticated) {
          // Redirect to login if trying to view own profile without being logged in
          router.push('/login') // Assuming you have a login page
          return
        }
        
        try {
          const profileData = await users.getProfile(username || 'me')
          setUser(profileData)
        } catch (err) {
          console.error('Failed to fetch profile:', err)
          
          // Handle 401 errors specifically
          if (err.message.includes('token') || err.message.includes('authorization')) {
            if (!username) {
              setError('Please log in to view your profile')
            } else {
              // For other users' profiles, we should still be able to view even if not logged in
              // This requires updating the backend to allow viewing profiles without auth
              setError('Failed to load profile. Authentication issues.')
            }
          } else {
            setError('Failed to load profile')
          }
          
          toast.error('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [username, isAuthenticated, router])

  const toggleFollow = () => {
    if (!isAuthenticated) {
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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse">Loading profile...</div>
      </div>
    )
  }

  // Show error state with more detail and action
  if (error || !user) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <div className="text-lg font-medium mb-2">Could not load profile</div>
        <div className="text-sm text-muted-foreground mb-4">{error || 'Unknown error'}</div>
        {error && error.includes('log in') ? (
          <Button onClick={() => router.push('/login')}>
            Log In
          </Button>
        ) : (
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        )}
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

