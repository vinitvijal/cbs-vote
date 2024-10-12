'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ThankYouAndWait() {
    const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Thank You for Your Interest</CardTitle>
          <CardDescription>Voting is Currently Closed</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            The voting period is not active at the moment. This could be because:
          </p>
          <ul className="list-none space-y-2 mb-6">
            <li className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Voting has not yet started</span>
            </li>
            <li className="flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span>Voting has already ended</span>
            </li>
          </ul>
          <p className="mb-6">
            Please check back later or contact the election administrators for more information.
          </p>
          <Button className="w-full" onClick={()=>{router.replace('/')}}>
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}