"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, User, Bookmark, Settings, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserData {
  username: string;
  avatarUrl?: string;
}

interface FollowInfo {
  followers: any[]; 
  following: any[]; 
}

export function Sidebar({ baseUrl }: { baseUrl: string }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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
        }

        // Fetch follow info from /followInfo/:username
        const resFollow = await fetch(`${baseUrl}/users/followInfo/${storedUsername}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (resFollow.ok) {
          const followData: FollowInfo = await resFollow.json();
          setFollowersCount(Array.isArray(followData.followers) ? followData.followers.length : 0);
          setFollowingCount(Array.isArray(followData.following) ? followData.following.length : 0);
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
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Link href="/profile" className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData.avatarUrl} alt={`@${userData.username}`} />
              <AvatarFallback>{userData.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userData.username}</p>
              <p className="text-xs text-muted-foreground">@{userData.username}</p>
            </div>
          </Link>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="font-medium">0</p>
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
              href="/profile"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            <Link
              href="/profile?tab=saved"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent"
            >
              <Bookmark className="h-4 w-4" />
              Saved
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
          <CardTitle className="text-sm font-medium">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Link href="#" className="block">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">#TechNews</span>
              </div>
              <p className="text-xs text-muted-foreground">24.5K posts</p>
            </Link>
            <Link href="#" className="block">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">#Photography</span>
              </div>
              <p className="text-xs text-muted-foreground">18.2K posts</p>
            </Link>
            <Link href="#" className="block">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">#Travel</span>
              </div>
              <p className="text-xs text-muted-foreground">12.7K posts</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Suggested Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`/placeholder.svg?height=32&width=32&text=${i}`}
                      alt={`User ${i}`}
                    />
                    <AvatarFallback>U{i}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">User {i}</p>
                    <p className="text-xs text-muted-foreground">@user{i}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
