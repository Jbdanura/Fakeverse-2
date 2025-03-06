import { useState, useEffect } from "react"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookmarkIcon, Heart, MessageCircle, MoreHorizontal, Send, Share2 } from "lucide-react"
import Link from "next/link"
import { LikesDialog } from "@/components/likes-dialog"
import { Textarea } from "@/components/ui/textarea"
import { posts as postsApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { Comment } from "@/components/comment"
import { comments } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface User {
  id: number
  name: string
  username: string
  avatar: string
  isFollowing: boolean
}

interface Comment {
  id: number
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  timestamp: string
  likes: number
  likedBy?: User[]
}

interface PostProps {
  post: {
    id: number
    user: {
      name: string
      username: string
      avatar: string
    }
    content: string
    image?: string
    timestamp: string
    likes: number
    comments: Comment[]
    likedBy?: User[]
    isLiked?: boolean
    created_at?: string
    username?: string
    profile_pic?: string
  }
  onLikeUpdate?: (postId: number, isLiked: boolean, likeCount: number) => void
  onCommentUpdate?: (postId: number, commentCount: number) => void
}

export function Post({ post, onLikeUpdate, onCommentUpdate }: PostProps) {
  const { user: authUser } = useAuth()
  const [liked, setLiked] = useState(post.isLiked || false)
  const [saved, setSaved] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [likeCount, setLikeCount] = useState(() => {
    // Ensure we always use a valid number
    const count = post?.like_count ? parseInt(post.like_count) : 0;
    console.log(`Initial like count for post ${post.id}:`, count);
    return isNaN(count) ? 0 : count;
  });
  const [showLikesDialog, setShowLikesDialog] = useState(false)
  const [showCommentLikesDialog, setShowCommentLikesDialog] = useState(false)
  const [selectedCommentId, setSelectedCommentId] = useState(null)
  const [postCommentsList, setPostCommentsList] = useState(post.comments || [])
  const [likedByUsers, setLikedByUsers] = useState<User[]>([])
  const [loadingLikes, setLoadingLikes] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [postComments, setPostComments] = useState([])
  const [commentCount, setCommentCount] = useState(post?.comment_count ? parseInt(post.comment_count) : 0)
  const [loadingComments, setLoadingComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  // Console.log to debug the actual structure
  console.log("Post data:", post);
  
  // Based on the server route, we should have username and profile_pic directly on the post
  // This adapts to either structure
  const postUsername = post.username || (post.user && post.user.username) || "unknown";
  const postUserAvatar = post.profile_pic || (post.user && (post.user.avatar || post.user.profile_pic)) || "/placeholder.svg?height=40&width=40";
  
  // For display name, we'll use username if no name is available
  const displayName = (post.user && post.user.name) || post.username || "User";

  // Function to fetch likes 
  const fetchLikes = async () => {
    try {
      setLoadingLikes(true);
      setLikedByUsers([]); // Clear existing data while loading
      
      const likesData = await postsApi.getLikes(post.id.toString());
      console.log(`Fetched ${likesData.length} likes for post ${post.id}`);
      setLikedByUsers(likesData);
    } catch (error) {
      console.error("Failed to fetch likes:", error);
      // Set to empty array on error
      setLikedByUsers([]);
      toast.error("Failed to load likes");
    } finally {
      setLoadingLikes(false);
    }
  };

  const handleLike = async () => {
    // Check if user is authenticated
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token');
    
    if (!authUser || !hasToken) {
      toast.error("Please login to like posts");
      return;
    }
    
    // Prevent multiple clicks during loading
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Get the current like state and count
      const currentLiked = isLiked;
      const currentCount = likeCount;
      
      // Optimistically update UI
      const newLikeState = !currentLiked;
      setIsLiked(newLikeState);
      
      // Update the count (increment or decrement by 1)
      const newLikeCount = newLikeState ? currentCount + 1 : Math.max(0, currentCount - 1);
      setLikeCount(newLikeCount);
      
      // If unliking and popup is open, remove self from likes list immediately
      if (!newLikeState && showLikesDialog && authUser) {
        // Instead of filtering, refresh the entire list to be safe
        fetchLikes();
      }
      
      // Notify parent component of like update
      if (onLikeUpdate) {
        onLikeUpdate(post.id, newLikeState, newLikeCount);
      }
      
      // Make API call
      try {
        if (newLikeState) {
          const response = await postsApi.like(post.id.toString());
          
          // Use the server-provided count
          if (response && typeof response.likeCount === 'number') {
            setLikeCount(response.likeCount);
            
            // Update parent with real count
            if (onLikeUpdate) {
              onLikeUpdate(post.id, true, response.likeCount);
            }
          }
          
          // If popup is open, refresh likes list
          if (showLikesDialog) {
            fetchLikes();
          }
        } else {
          const response = await postsApi.unlike(post.id.toString());
          
          // Use the server-provided count
          if (response && typeof response.likeCount === 'number') {
            setLikeCount(response.likeCount);
            
            // Update parent with real count
            if (onLikeUpdate) {
              onLikeUpdate(post.id, false, response.likeCount);
            }
          }
          
          // If popup is open, refresh likes list
          if (showLikesDialog) {
            fetchLikes();
          }
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        
        // Handle error cases...
        // Revert UI changes and notify user
        setIsLiked(currentLiked);
        setLikeCount(currentCount);
        
        // If we reverted an unlike, put the user back in the likes list
        if (currentLiked && showLikesDialog && authUser) {
          fetchLikes(); // Re-fetch the complete list
        }
        
        // Show appropriate error
        if (apiError.message?.includes('Post already liked')) {
          toast.error("You've already liked this post");
        } else if (apiError.message?.includes('Post was not liked')) {
          toast.error("You haven't liked this post");
        } else {
          toast.error("Failed to update like");
        }
        
        // Notify parent of reversion
        if (onLikeUpdate) {
          onLikeUpdate(post.id, currentLiked, currentCount);
        }
      }
    } catch (error) {
      console.error("Failed to like/unlike post:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(!saved)
  }

  const handleComment = async () => {
    if (commentText.trim()) {
      try {
        const response = await postsApi.comment(post.id, commentText)
        setPostCommentsList(prev => [...prev, response])
      setCommentText("")
      } catch (error) {
        console.error("Failed to add comment:", error)
        toast.error("Failed to add comment")
      }
    }
  }

  const openLikesDialog = async () => {
    try {
      setShowLikesDialog(true);
      fetchLikes();
    } catch (error) {
      console.error("Failed to open likes dialog:", error);
      toast.error("Failed to load likes");
    }
  };

  const openCommentLikesDialog = (commentId) => {
    // This would need a similar API endpoint for comment likes
    setSelectedCommentId(commentId)
    setShowCommentLikesDialog(true)
  }

  // Format timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    
    // If timestamp is already a string in readable format, return it
    if (typeof timestamp === 'string' && !timestamp.includes('T')) {
      return timestamp
    }
    
    try {
      const date = new Date(timestamp)
      
      // Check if the date is today
      const today = new Date()
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      // Check if the date is yesterday
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday'
      }
      
      // Otherwise show date
      return date.toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return timestamp
    }
  }

  // For debugging - log the post structure to console
  console.log("Post data structure:", post)

  useEffect(() => {
    console.log(`Post ${post.id} like count:`, likeCount)
  }, [post.id, likeCount])

  useEffect(() => {
    // Only check liked status if we don't already know
    if (post?.is_liked === undefined) {
      const checkLiked = async () => {
        if (!authUser) return
        
        try {
          const response = await postsApi.checkLiked(post.id.toString())
          setIsLiked(response.liked)
          
          // Update like count if provided
          if (response.likeCount !== undefined) {
            setLikeCount(response.likeCount)
          }
        } catch (error) {
          console.error("Failed to check if post is liked:", error)
        }
      }
      
      checkLiked()
    } else {
      setIsLiked(!!post.is_liked)
    }
  }, [post, authUser])

  useEffect(() => {
    if (post?.comment_count !== undefined) {
      const count = parseInt(post.comment_count)
      if (!isNaN(count)) {
        setCommentCount(count)
      }
    }
  }, [post])

  const fetchComments = async () => {
    if (!showComments) return
    
    try {
      setLoadingComments(true)
      
      const data = await comments.getForPost(post.id.toString())
      console.log("Fetched comments:", data); // Log comments data for debugging
      setPostComments(data)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
      setPostComments([])
      toast.error("Failed to load comments")
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [showComments])

  const handleToggleComments = () => {
    setShowComments(prev => !prev)
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!commentText.trim()) return
    
    try {
      setSubmittingComment(true)
      
      const { comment, commentCount: newCount } = await comments.add(post.id.toString(), commentText)
      
      // Add the new comment to the list
      setPostComments(prev => [...prev, comment])
      
      // Update comment count
      setCommentCount(newCount)
      
      // Clear the input
      setCommentText("")
      
      // Notify parent if needed
      if (onCommentUpdate) {
        onCommentUpdate(post.id, newCount)
      }
    } catch (error) {
      console.error("Failed to add comment:", error)
      toast.error("Failed to add comment")
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      // No need to make the API call here as it's already handled in the Comment component
      // Just update the UI
      setPostComments(prev => prev.filter(comment => comment.id.toString() !== commentId))
      
      // Update the comment count
      setCommentCount(prev => Math.max(0, prev - 1))
      
      // Notify parent if needed
      if (onCommentUpdate) {
        onCommentUpdate(post.id, commentCount - 1)
      }
    } catch (error) {
      console.error("Failed to handle comment deletion:", error)
      // Refresh comments to get accurate state
      fetchComments()
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (e) {
      return "some time ago"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Link href={`/profile/${postUsername}`} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={postUserAvatar} alt={postUsername} />
              <AvatarFallback>{displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{post.username || "Unknown User"}</div>
              <div className="text-xs text-muted-foreground">@{post.username || "unknown"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {formatDate(post.created_at || post.timestamp)}
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem>Hide post</DropdownMenuItem>
              <DropdownMenuItem>Follow {displayName}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Report post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="mb-3">{post.content}</p>
        {post.image && (
          <div className="relative rounded-md overflow-hidden mb-3">
            <Image
              src={post.image || "/placeholder.svg"}
              alt="Post image"
              width={600}
              height={400}
              className="w-full object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col pt-0">
        <div className="flex items-center justify-between w-full">
          <button
            className="flex items-center gap-1 text-muted-foreground text-sm hover:underline"
            onClick={openLikesDialog}
          >
            <Heart className={cn("h-4 w-4", liked ? "fill-primary text-primary" : "")} />
            <span>{likeCount} likes</span>
          </button>
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <span>{commentCount} comments</span>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="flex items-center justify-between w-full">
          <Button
            variant={isLiked ? "default" : "ghost"}
            size="sm"
            className={cn("gap-1", isLiked ? "bg-red-500 hover:bg-red-600 text-white" : "")}
            onClick={handleLike}
            disabled={loading}
          >
            <Heart className={cn("h-4 w-4", isLiked ? "fill-current" : "")} />
            {isLiked ? "Liked" : likeCount}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-muted-foreground"
            onClick={handleToggleComments}
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount}
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
            <BookmarkIcon className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`} />
            Save
          </Button>
        </div>

        {showComments && (
          <div className="w-full px-4 pt-0 pb-4">
            <div className="w-full pt-4 border-t">
              {/* Comment input */}
              {authUser && (
                <form onSubmit={handleSubmitComment} className="mb-4 w-full">
                  <div className="flex w-full items-start space-x-2">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={authUser.profile_pic || "/placeholder.svg"} alt={authUser.username} />
                      <AvatarFallback>{authUser.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                    <div className="flex-1 w-full">
                      <Textarea
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[80px] resize-none w-full mb-2"
                      />
                      <div className="flex justify-end w-full">
                        <Button 
                          type="submit" 
                          size="sm" 
                          disabled={!commentText.trim() || submittingComment}
                        >
                          {submittingComment ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Posting...
                            </>
                          ) : (
                            "Post Comment"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments list */}
              <div className="space-y-4">
                {loadingComments ? (
                  <div className="py-4 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : postComments.length > 0 ? (
                  <>
                    <h4 className="text-sm font-medium mb-2">
                      {postComments.length} {postComments.length === 1 ? "Comment" : "Comments"}
                    </h4>
                    <div className="space-y-4">
                      {postComments.map(comment => (
                        <Comment 
                          key={comment.id} 
                          comment={comment} 
                          onDelete={handleDeleteComment} 
                        />
                      ))}
                </div>
                  </>
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    No comments yet. Be the first to comment!
              </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Post Likes Dialog */}
      <LikesDialog
        open={showLikesDialog}
        onOpenChange={setShowLikesDialog}
        title="Liked by"
        users={likedByUsers}
        loading={loadingLikes}
      />

      {/* Comment Likes Dialog */}
      {/* <LikesDialog
        open={showCommentLikesDialog}
        onOpenChange={setShowCommentLikesDialog}
        title="Comment Likes"
        users={getSelectedCommentLikes()}
      /> */}
    </Card>
  )
}

