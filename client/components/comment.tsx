"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { comments } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/context/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface CommentProps {
  comment: any
  onDelete: (commentId: string) => void
}

export function Comment({ comment, onDelete }: CommentProps) {
  const { user: authUser } = useAuth()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  const isOwnComment = comment.is_own_comment || 
    (authUser && comment.user_id && authUser.id === comment.user_id);
  
  const formattedDate = comment.created_at 
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : "some time ago"
  
  const handleDeleteComment = async () => {
    setIsDeleting(true)
    try {
      await comments.delete(comment.id.toString())
      onDelete(comment.id.toString())
      toast.success("Comment deleted")
    } catch (error) {
      console.error("Failed to delete comment:", error)
      toast.error("Failed to delete comment")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div 
      className="flex gap-2 p-2 rounded-md transition-colors group relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={`/profile/${comment.username}`} className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.profile_pic || "/placeholder.svg"} alt={comment.username} />
          <AvatarFallback>{comment.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <Link href={`/profile/${comment.username}`} className="font-medium hover:underline">
              {comment.username}
            </Link>
            <span className="text-xs text-muted-foreground ml-2">{formattedDate}</span>
          </div>
        </div>
        <div className="text-sm pr-6">{comment.content}</div>
      </div>
      
      {isOwnComment && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "h-6 w-6 absolute top-2 right-2 transition-opacity duration-200",
            isHovering ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setShowDeleteDialog(true)}
          aria-label="Delete comment"
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
          <span className="sr-only">Delete</span>
        </Button>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault()
                handleDeleteComment()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 