import { Post } from "@/components/post"

export function ProfilePosts() {
  // Sample users who liked posts
  const sampleUsers = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      isFollowing: true,
    },
    {
      id: 2,
      name: "Mike Peters",
      username: "mikepeters",
      avatar: "/placeholder.svg?height=100&width=100&text=MP",
      isFollowing: false,
    },
    {
      id: 3,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=100&width=100&text=EW",
      isFollowing: true,
    },
    {
      id: 5,
      name: "Taylor Swift",
      username: "tswift",
      avatar: "/placeholder.svg?height=100&width=100&text=TS",
      isFollowing: true,
    },
  ]

  // Sample posts data
  const posts = [
    {
      id: 1,
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder.svg?height=40&width=40&text=JD",
      },
      content:
        "Just finished my latest photography project! Here's one of my favorite shots from the series. What do you think?",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "2 hours ago",
      likes: 124,
      likedBy: sampleUsers,
      comments: [
        {
          id: 1,
          user: {
            name: "Mike Peters",
            username: "mikepeters",
            avatar: "/placeholder.svg?height=32&width=32&text=MP",
          },
          content: "This is absolutely stunning! The lighting is perfect.",
          timestamp: "1 hour ago",
          likes: 8,
          likedBy: sampleUsers.slice(0, 3),
        },
        {
          id: 2,
          user: {
            name: "Emma Wilson",
            username: "emmaw",
            avatar: "/placeholder.svg?height=32&width=32&text=EW",
          },
          content: "Love the composition! What camera did you use?",
          timestamp: "45 minutes ago",
          likes: 3,
          likedBy: sampleUsers.slice(1, 3),
        },
      ],
    },
    {
      id: 2,
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder.svg?height=40&width=40&text=JD",
      },
      content: "Working from my favorite coffee shop today. The productivity is real! ☕️💻",
      image: "/placeholder.svg?height=400&width=600",
      timestamp: "2 days ago",
      likes: 87,
      likedBy: sampleUsers.slice(0, 2),
      comments: [
        {
          id: 1,
          user: {
            name: "Taylor Swift",
            username: "tswift",
            avatar: "/placeholder.svg?height=32&width=32&text=TS",
          },
          content: "That place has the best lattes!",
          timestamp: "1 day ago",
          likes: 12,
          likedBy: sampleUsers.slice(2, 4),
        },
      ],
    },
    {
      id: 3,
      user: {
        name: "John Doe",
        username: "johndoe",
        avatar: "/placeholder.svg?height=40&width=40&text=JD",
      },
      content:
        "Just published my new article on web development trends in 2023. Check it out and let me know your thoughts!",
      timestamp: "1 week ago",
      likes: 56,
      likedBy: sampleUsers.slice(1, 4),
      comments: [],
    },
  ]

  return (
    <div className="space-y-4 max-w-3xl">
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  )
}

