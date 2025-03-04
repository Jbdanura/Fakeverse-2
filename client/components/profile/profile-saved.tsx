import { Post } from "@/components/post"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePhotos } from "@/components/profile/profile-photos"

export function ProfileSaved() {
  // Sample saved posts data
  const savedPosts = [
    {
      id: 1,
      user: {
        name: "Sarah Johnson",
        username: "sarahj",
        avatar: "/placeholder.svg?height=40&width=40&text=SJ",
      },
      content:
        "Just got back from an amazing trip to Japan! The cherry blossoms were in full bloom and it was absolutely magical. Can't wait to share more photos!",
      image: "/placeholder.svg?height=400&width=600&text=Japan",
      timestamp: "3 days ago",
      likes: 245,
      comments: [
        {
          id: 1,
          user: {
            name: "John Doe",
            username: "johndoe",
            avatar: "/placeholder.svg?height=32&width=32&text=JD",
          },
          content: "Looks incredible! I've always wanted to visit during cherry blossom season.",
          timestamp: "2 days ago",
          likes: 14,
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "Mike Peters",
        username: "mikepeters",
        avatar: "/placeholder.svg?height=40&width=40&text=MP",
      },
      content:
        "Just finished reading this amazing book on photography composition. Highly recommend for anyone looking to improve their skills!",
      timestamp: "1 week ago",
      likes: 78,
      comments: [],
    },
  ]

  return (
    <div className="max-w-3xl">
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {savedPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {savedPosts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </TabsContent>

        <TabsContent value="photos">
          <ProfilePhotos />
        </TabsContent>
      </Tabs>
    </div>
  )
}

