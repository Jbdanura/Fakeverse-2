"use client"

import { useState } from "react"
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

export function ProfileHeader() {
  const [isFollowing, setIsFollowing] = useState(false)
  const [showFollowersDialog, setShowFollowersDialog] = useState(false)
  const [dialogType, setDialogType] = useState<"followers" | "following">("followers")

  const toggleFollow = () => {
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

  // Mock user data
  const user = {
    name: "John Doe",
    username: "johndoe",
    bio: "Photographer, traveler, and coffee enthusiast. Sharing my adventures and creative work.",
    location: "San Francisco, CA",
    website: "johndoe.com",
    joinDate: "Joined January 2020",
    coverImage: "/placeholder.svg?height=400&width=1200",
    avatar: "/placeholder.svg?height=150&width=150",
    stats: {
      posts: 254,
      followers: 1243,
      following: 342,
    },
  }

  return (
    <div className="mb-6">
      {/* Cover Photo */}
      <div className="relative w-full h-[200px] md:h-[300px] rounded-t-xl overflow-hidden">
        <Image src={user.coverImage || "/placeholder.svg"} alt="Cover photo" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Profile Info */}
      <div className="relative px-4 pb-4 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Avatar */}
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name.charAt(0)}
                {user.name.split(" ")[1]?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="mt-2 md:mt-0 md:mb-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
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
          <p>{user.bio}</p>

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
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {user.joinDate}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4">
          <div>
            <span className="font-bold">{user.stats.posts}</span> <span className="text-muted-foreground">Posts</span>
          </div>
          <button onClick={openFollowersDialog} className="hover:underline">
            <span className="font-bold">{user.stats.followers}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </button>
          <button onClick={openFollowingDialog} className="hover:underline">
            <span className="font-bold">{user.stats.following}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </button>
        </div>
      </div>

      {/* Followers/Following Dialog */}
      <FollowersDialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog} type={dialogType} />
    </div>
  )
}

