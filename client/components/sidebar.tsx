"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, User, Bookmark, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";

interface UserData {
  username: string;
  avatarUrl?: string;
}

interface FollowInfo {
  followers: any[]; 
  following: any[]; 
}

interface RecommendedUser {
  id: number;
  username: string;
}

export function Sidebar({ baseUrl }: { baseUrl: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [userPostsCount, setUserPostsCount] = useState<number>(0);
  const [recommendedUsers, setRecommendedUsers] = useState<RecommendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const cloudName = "dchytnqhl";
  
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      const storedUsername = localStorage.getItem("username");
      if (!token || !storedUsername) {
        setLoading(false);
        return;
      }

      try {
        const resUser = await fetch(`${baseUrl}/users/user/${storedUsername}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (resUser.ok) {
          const data = await resUser.json();
          setUserData({
            username: data.username,
            avatarUrl: data.avatarUrl || "",
          });
          const responsePostCount = await axios.get(`${baseUrl}/posts/count/${storedUsername}`);
          setUserPostsCount(responsePostCount.data.count);
        }

        const resFollow = await fetch(`${baseUrl}/users/followInfo/${storedUsername}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (resFollow.ok) {
          const followData: FollowInfo = await resFollow.json();
          setFollowersCount(Array.isArray(followData.followers) ? followData.followers.length : 0);
          setFollowingCount(Array.isArray(followData.following) ? followData.following.length : 0);
        }

        const resRecommended = await fetch(`${baseUrl}/users/recommended`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (resRecommended.ok) {
          const recommendedData: RecommendedUser[] = await resRecommended.json();
          setRecommendedUsers(recommendedData);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [baseUrl]);

  if (loading) {
    return (
      <div className="space-y-4 sticky top-20">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="space-y-4 sticky top-20">
        <p>Error loading user data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sticky top-20">
      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href={`/profile/${userData.username}`} className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${userData.username}.png`} src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${userData.username}.png`} alt={`@${userData.username}`} />
              <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userData.username}</p>
              <p className="text-xs text-muted-foreground">@{userData.username}</p>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-medium">{userPostsCount}</p>
              <p className="text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-medium">{followersCount}</p>
              <p className="text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-medium">{followingCount}</p>
              <p className="text-muted-foreground">Following</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href={`/profile/${userData.username}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Suggested People</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedUsers.length > 0 ? (
              recommendedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <a className="flex items-center gap-2" href={`/profile/${user.username}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        key={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${user.username}.png`}
                        src={`https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${user.username}.png`}
                        alt={user.username}
                      />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </a>

                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No suggestions available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
