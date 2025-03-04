import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function ProfileFriends() {
  // Sample friends data
  const friends = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "sarahj",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      mutualFriends: 12,
    },
    {
      id: 2,
      name: "Mike Peters",
      username: "mikepeters",
      avatar: "/placeholder.svg?height=100&width=100&text=MP",
      mutualFriends: 8,
    },
    {
      id: 3,
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=100&width=100&text=EW",
      mutualFriends: 15,
    },
    {
      id: 4,
      name: "Alex Morgan",
      username: "alexm",
      avatar: "/placeholder.svg?height=100&width=100&text=AM",
      mutualFriends: 5,
    },
    {
      id: 5,
      name: "Taylor Swift",
      username: "tswift",
      avatar: "/placeholder.svg?height=100&width=100&text=TS",
      mutualFriends: 3,
    },
    {
      id: 6,
      name: "Chris Evans",
      username: "chrise",
      avatar: "/placeholder.svg?height=100&width=100&text=CE",
      mutualFriends: 7,
    },
    {
      id: 7,
      name: "Jessica Alba",
      username: "jessicaa",
      avatar: "/placeholder.svg?height=100&width=100&text=JA",
      mutualFriends: 9,
    },
    {
      id: 8,
      name: "Ryan Reynolds",
      username: "ryanr",
      avatar: "/placeholder.svg?height=100&width=100&text=RR",
      mutualFriends: 4,
    },
    {
      id: 9,
      name: "Jennifer Lopez",
      username: "jlop",
      avatar: "/placeholder.svg?height=100&width=100&text=JL",
      mutualFriends: 6,
    },
    {
      id: 10,
      name: "Tom Hanks",
      username: "tomh",
      avatar: "/placeholder.svg?height=100&width=100&text=TH",
      mutualFriends: 11,
    },
    {
      id: 11,
      name: "Scarlett Johansson",
      username: "scarlettj",
      avatar: "/placeholder.svg?height=100&width=100&text=SJ",
      mutualFriends: 2,
    },
    {
      id: 12,
      name: "Leonardo DiCaprio",
      username: "leod",
      avatar: "/placeholder.svg?height=100&width=100&text=LD",
      mutualFriends: 8,
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Friends · {friends.length}</h2>
        <Button variant="link">Find Friends</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {friends.map((friend) => (
          <Card key={friend.id} className="overflow-hidden">
            <Link href={`/profile/${friend.username}`} className="block">
              <div className="relative aspect-square">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={friend.avatar} alt={friend.name} className="object-cover" />
                  <AvatarFallback className="rounded-none text-2xl">
                    {friend.name.charAt(0)}
                    {friend.name.split(" ")[1]?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{friend.name}</h3>
                <p className="text-xs text-muted-foreground">{friend.mutualFriends} mutual friends</p>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}

