"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AccountSettings() {
  const [email, setEmail] = useState("johndoe@example.com")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your API
    console.log("Updated email:", email)
    alert("Email updated successfully!")
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      alert("New passwords don't match!")
      return
    }

    // In a real app, you would send this data to your API
    console.log("Password updated")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    alert("Password updated successfully!")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Update your email address associated with your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleEmailSubmit}>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Email</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Update Password</Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Management</CardTitle>
          <CardDescription>Manage your account status and data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Download Your Data</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Get a copy of your data, including posts, photos, comments, and profile information.
            </p>
            <Button variant="outline">Request Data Export</Button>
          </div>

          <Separator className="my-4" />

          <div>
            <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Permanently delete your account and all of your content.
            </p>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                This action cannot be undone. This will permanently delete your account and remove your data from our
                servers.
              </AlertDescription>
            </Alert>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

