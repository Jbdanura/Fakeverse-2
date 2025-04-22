// components/settings/profile‑settings.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";

export function ProfileSettings() {
  const baseUrl = "http://localhost:5000";
  const cloudName = "dchytnqhl";
  const [bio, setBio] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>(
    "/placeholder.svg"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      // optimistic preview
      setAvatarPreview(base64);

      // upload to your server, which in turn pushes to Cloudinary
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`${baseUrl}/users/uploadAvatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ data: base64 }),
        });
        if (!res.ok) {
          const err = await res.text();
          throw new Error(err);
        }

        const { secure_url } = await res.json();
        setAvatarPreview(secure_url);
        setMessage("Avatar updated!");
      } catch (err: any) {
        console.error(err);
        setMessage("Upload failed: " + (err.message || err));
      }
    };
    reader.readAsDataURL(file);
  };

  // on mount, load existing avatar directly from Cloudinary by username
  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username && cloudName) {
      setAvatarPreview(
        `https://res.cloudinary.com/${cloudName}/image/upload/fakeverse/${username}.png`
      );
    }
  }, [cloudName]);

  // bio save (unchanged)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${baseUrl}/users/bio`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      setMessage("Bio updated successfully!");
    } catch (err: any) {
      console.error(err);
      setMessage("Error: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile and avatar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} alt="You" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                {/* Invisible file input covering the camera button */}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="absolute -bottom-2 -right-2 h-8 w-8 opacity-0 cursor-pointer"
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white flex items-center justify-center shadow cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                </label>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Upload a new profile picture</p>
                <p>JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col items-start gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
