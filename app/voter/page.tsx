'use client'
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import sscbs from '@/app/sscbs.jpg'
import { useRouter } from "next/navigation"
import { Candidate, Voter } from "@prisma/client"
import { getCbsStatus, getVoter } from "@/actions/auth/action"
import { toast } from "sonner"
import { Candidates, Voting } from "@/actions/votes/actions"


export default function Component() {
  const router = useRouter();
  
  const [userData, setUserData] = useState<Voter | null>(null)
  const [votes, setVotes] = useState<Record<string, string>>({})
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
      const status = await getCbsStatus();
      console.log(status)
      if(status === false) {
        toast.error("Voting is closed")
        router.replace("/voter/thankyou")
        return
      }
      const data = await getVoter(vid)
      if(!data) {
        toast.error("You are not logged in")
        router.push("/")
        return
      }else{
        setUserData(data)
        console.log("User data", data)
        setHasVoted(data.voted)
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
    if(!posts) return;
    const totalPositions = posts.length
    setProgress((votedPositions / totalPositions) * 100)
  }, [votes])

  const handleVote = (positionId: string, candidateId: string) => {
    setVotes(prev => ({ ...prev, [positionId]: candidateId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(votes)
    setIsSubmitting(true)
    if(!userData){
      toast.error("You are not logged in")
      router.push("/")
      return
    }
    const status = await getCbsStatus();
    if(status === false) {
      toast.error("Voting is closed, Your vote has not been submitted")
      router.replace("/voter/thankyou")
      return
    }
    const res = await Voting(votes, userData.vid)
    if(res === true) {
      toast.success("Vote submitted successfully")
      setHasVoted(true)
    }else{
      toast.error("You have already voted")
      setHasVoted(true)
    }

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
            {userData.name + ", " + userData.por + " | " + userData.society}
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
                  {posts && posts.map((position, idx) => (
                    <div key={idx} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2 text-gray-700">{position}</h3>
                      <RadioGroup
                        onValueChange={(value) => handleVote(position, value)}
                        value={votes[idx]?.toString()}
                        className="space-y-2"
                      >
                        {candidates && candidates.filter((value) => value.position === position).map(candidate => (
                          <div key={candidate.cid} className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm transition-all hover:shadow-md">
                            <RadioGroupItem value={candidate.cid} id={`${position}-${candidate.cid}`} />
                            <Label htmlFor={`${position}-${candidate.cid}`} className="flex-grow cursor-pointer">
                              {candidate.name} | {candidate.rollno}
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