import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Calendar, GraduationCap, Heart, Home, MapPin } from "lucide-react"

export function ProfileAbout() {
  // Sample user data
  const user = {
    bio: "Photographer, traveler, and coffee enthusiast. Sharing my adventures and creative work.",
    work: [
      { company: "Creative Studios", position: "Senior Photographer", period: "2020 - Present" },
      { company: "Travel Magazine", position: "Freelance Photographer", period: "2018 - 2020" },
    ],
    education: [{ school: "Art Institute", degree: "Bachelor of Fine Arts, Photography", period: "2014 - 2018" }],
    currentCity: "San Francisco, California",
    hometown: "Portland, Oregon",
    relationshipStatus: "Single",
    joinedDate: "January 2020",
  }

  return (
    <div className="grid gap-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{user.bio}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.work.map((job, index) => (
              <div key={index} className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">
                    {job.position} at {job.company}
                  </div>
                  <div className="text-sm text-muted-foreground">{job.period}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {user.education.map((edu, index) => (
              <div key={index} className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="font-medium">{edu.degree}</div>
                  <div className="text-sm">{edu.school}</div>
                  <div className="text-sm text-muted-foreground">{edu.period}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Current City</div>
                <div>{user.currentCity}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Home className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Hometown</div>
                <div>{user.hometown}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Relationship Status</div>
                <div>{user.relationshipStatus}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Joined</div>
                <div>{user.joinedDate}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

