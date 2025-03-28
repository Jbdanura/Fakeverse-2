"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

interface Like{
  createdAt: string;
  updatedAt: string;
  id: number;
  postId: number;
  userId: number;
  user:{
    username: string;
  }
}

interface LikesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  likes: Like[];
}

export function LikesDialog({ open, onOpenChange, title = "Likes", likes }: LikesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {likes.length > 0 ? (
              likes.map((like) => (
                <Link
                  key={like.id}
                  href={`/profile/${like.user.username}`}
                  className="block p-2 hover:bg-gray-100 rounded"
                >
                  {like.user.username}
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
