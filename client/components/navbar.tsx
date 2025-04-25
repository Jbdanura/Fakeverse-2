// components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Home, Menu, MessageSquare, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface navbarProps{
  baseUrl: string;
}

export function Navbar({baseUrl}:navbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const router = useRouter();

  const cloudName = "dchytnqhl";
  const username = typeof window !== "undefined" ? localStorage.getItem("username") : null;
  const [avatarUrl, setAvatarUrl] = useState<string>("/placeholder.svg");

  useEffect(() => {
    if (cloudName && username) {
      setAvatarUrl(
        `https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${username}.png`
      );
    }
  }, [cloudName, username]);

  const handleSearchClick = async () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${baseUrl}/users/user/${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();

        if (data?.username) {
          router.push(`/profile/${data.username}`);
          setSearchQuery("");
        } else {
          setSearchError("User not found");
          setTimeout(() => setSearchError(""), 2000);
        }
      } else {
        setSearchError("User not found");
        setTimeout(() => setSearchError(""), 2000);
      }
    } catch (error) {
      setSearchError("Error searching for user");
      setTimeout(() => setSearchError(""), 2000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-4">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Home className="h-5 w-5" /> Home
                  </div>
                </Link>
                {/*
                <Link href="/chat" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MessageSquare className="h-5 w-5" /> Messages
                  </div>
                </Link>*/}
                <Link
                  href={`/profile/${username}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-5 w-5" /> Profile
                  </div>
                </Link>
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Settings className="h-5 w-5" /> Settings
                  </div>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-primary"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32" />
            </svg>
            <span className="font-bold text-xl hidden sm:inline-block">Fakeverse</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center relative max-w-sm">
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-10 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            className="ml-4 p-1"
          >
            <Search className="h-4 w-4" />
          </Button>
          {searchError && (
            <div className="absolute top-full left-0 text-red-500 text-sm mt-3">
              {searchError}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          {/*
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <MessageSquare className="h-5 w-5" />
              <span className="sr-only">Messages</span>
            </Button>
          </Link>*/}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} key={avatarUrl} alt={username || ""} />
                  <AvatarFallback>{username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/profile/${username}`} className="w-full">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="w-full">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  window.location.reload();
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
