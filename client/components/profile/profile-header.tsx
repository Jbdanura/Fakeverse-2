"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, LinkIcon, MapPin, MessageSquare, MoreHorizontal, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FollowersDialog } from "@/components/profile/followers-dialog";

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  location?: string;
  website?: string;
  joinDate: string;
  coverImage: string;
  avatar: string; 
  stats: {
    posts: number;
  };
}

interface ProfileHeaderProps {
  baseUrl: string;
  username: string;
}

export function ProfileHeader({ username, baseUrl }: ProfileHeaderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"followers" | "following">("followers");
  const [followersList, setFollowersList] = useState<string[]>([]);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const cloudName = "dchytnqhl";
  
  const toggleFollow = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    await fetch(`${baseUrl}/users/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userToFollow: username }),
    });
    setIsFollowing((v) => !v);
  };

  const openFollowersDialog = () => {
    setDialogType("followers");
    setShowFollowersDialog(true);
  };

  const openFollowingDialog = () => {
    setDialogType("following");
    setShowFollowersDialog(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !username) {
      setLoading(false);
      return;
    }
    fetch(`${baseUrl}/users/followInfo/${username}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ followers, following }) => {
        setFollowersList(followers.map((f: any) => f.follower.username));
        setFollowingList(following.map((f: any) => f.following.username));
      })
      .catch(console.error);
    fetch(`${baseUrl}/users/user/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        const profile = data.dataValues ? data.dataValues : data;
        const userProfile: UserProfile = {
          name: profile.name || profile.username,
          username: profile.username,
          bio: profile.biography || "No bio provided.",
          location: profile.location || "",
          website: profile.website || "",
          joinDate: profile.updatedAt
          ? `Joined ${profile.updatedAt.slice(0, 10)}`
          : "Joined date unknown",
          coverImage: profile.coverImage || "/placeholder.svg?height=400&width=1200",
          avatar: profile.avatar || "/placeholder.svg?height=150&width=150",
          stats: {
            posts: profile.posts ? profile.posts.length : 0,
          },
          
        };
        setUser(userProfile);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });

      fetch(`${baseUrl}/users/followingState`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ follower: localStorage.getItem("username"), following: username }),
      }).then(res => res.json())
      .then(res => {
        setIsFollowing(res)
      })

  }, [baseUrl, username]);

  if (loading) {
    return <div className="mb-6">Loading profile...</div>;
  }
  if (!user) {
    return <div className="mb-6">Error loading profile.</div>;
  }

  const getAvatarInitials = () => {
    const names = user.name.split(" ");
    return names.length > 1 ? names[0].charAt(0) + names[1].charAt(0) : names[0].charAt(0);
  };

  return (
    <div className="mb-6 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative  md:h-[100px] rounded-t-xl overflow-hidden">
      </div>

      <div className="relative px-4 pb-4 -mt-16 md:-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${user.username}.png`} alt={user.name} />
              <AvatarFallback>{getAvatarInitials()}</AvatarFallback>
            </Avatar>
            
            <div className="mt-2 md:mt-0 md:mb-2" style={{transform:"translateY(-15px)"}}>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {localStorage.getItem("username") !== username ? 
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
         : null }
         </div>

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

        <div className="flex gap-4 mt-4">
          <div>
            <span className="font-bold">{user.stats.posts}</span> <span className="text-muted-foreground">Posts</span>
          </div>
          <button onClick={openFollowersDialog} className="hover:underline">
            <span className="font-bold">{followersList.length}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </button>
          <button onClick={openFollowingDialog} className="hover:underline">
            <span className="font-bold">{followingList.length}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </button>
        </div>
      </div>

      <FollowersDialog open={showFollowersDialog} onOpenChange={setShowFollowersDialog} type={dialogType} followers={followersList} following={followingList} />
    </div>
  );
}
