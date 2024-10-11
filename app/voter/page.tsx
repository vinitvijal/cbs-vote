'use client'
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, CheckCircle2, Vote } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import sscbs from '@/app/sscbs.jpg'
import { useRouter } from "next/navigation"
import { Candidate, Voter } from "@prisma/client"
import { getVoter } from "@/actions/auth/action"
import { toast } from "sonner"
import { Candidates } from "@/actions/votes/actions"

const positions = [
  {
    id: 1,
    title: "President",
    candidates: [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ],
  },
  {
    id: 2,
    title: "Vice President",
    candidates: [
      { id: 3, name: "Alice Johnson" },
      { id: 4, name: "Bob Williams" },
    ],
  },
  {
    id: 3,
    title: "Cultural Head",
    candidates: [
      { id: 5, name: "Charlie Brown" },
      { id: 6, name: "Diana Clark" },
    ],
  },
  {
    id: 4,
    title: "First Year Representative",
    candidates: [
      { id: 7, name: "Eva Green" },
      { id: 8, name: "Frank White" },
    ],
  },
]

export default function Component() {
  const router = useRouter();
  
  const [userData, setUserData] = useState<Voter | null>(null)
  const [votes, setVotes] = useState<Record<number, number>>({})
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [posts, setPosts] = useState<string[]>()
  const [candidates, setCandidates] = useState<Candidate[]>()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const vid = sessionStorage.getItem("vid")
      const role = sessionStorage.getItem("role")
      if(!vid || vid === null || role !== "voter") {
        toast.error("You are not logged in")
        router.push("/")
        return;
      }
      console.log(vid)
      const data = await getVoter(vid)
      if(!data) {
        toast.error("You are not logged in")
        router.push("/")
        return
      }else{
        setUserData(data)
        console.log("User data", data)
        setHasVoted(userData?.voted || false)
      }

      const cand = await Candidates()
      const pos = cand.map((c) => c.position).filter((value, index, self) => self.indexOf(value) === index)
      setPosts(pos)
      setCandidates(cand)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const votedPositions = Object.keys(votes).length
    const totalPositions = positions.length
    setProgress((votedPositions / totalPositions) * 100)
  }, [votes])

  const handleVote = (positionId: number, candidateId: number) => {
    setVotes(prev => ({ ...prev, [positionId]: candidateId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    localStorage.setItem("hasVoted", "true")
    setHasVoted(true)
    setIsSubmitting(false)
  }

  return userData && (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center mb-4 sm:mb-0">
            <Image
              src={sscbs}
              alt="College Logo"
              width={50}
              height={50}
              className="mr-3"
            />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Shaheed Sukhdev College of Business Studies</h1>
          </div>
          <div className="text-center sm:text-right">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700">College Council Election</h2>
            <p className="text-sm text-gray-600">{userData.name + ", " + userData.por + " | " + userData.society}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="border-b border-gray-200 pb-7 mb-4">
            {/* <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
              <Vote className="h-6 w-6 text-blue-600" />
            </div> */}
            <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
                  {/* <Vote className="h-6 w-6 text-blue-600" /> */}
            Voting Ballot</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Select your candidates for each position
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasVoted ? (
              <Alert variant="default">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle>Vote Submitted</AlertTitle>
                <AlertDescription>
                  Thank you for participating in the College Council Election. Your vote has been recorded.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                <ScrollArea className="h-[50vh] pr-4">
                  {positions.map(position => (
                    <div key={position.id} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">{position.title}</h3>
                      <RadioGroup
                        onValueChange={(value) => handleVote(position.id, parseInt(value))}
                        value={votes[position.id]?.toString()}
                        className="space-y-2"
                      >
                        {position.candidates.map(candidate => (
                          <div key={candidate.id} className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm transition-all hover:shadow-md">
                            <RadioGroupItem value={candidate.id.toString()} id={`${position.id}-${candidate.id}`} />
                            <Label htmlFor={`${position.id}-${candidate.id}`} className="flex-grow cursor-pointer">
                              {candidate.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </ScrollArea>
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-500">
                      <span>Voting Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting || progress < 100}>
                    {isSubmitting ? "Submitting..." : progress < 100 ? "Please vote for all positions" : "Submit Vote"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}