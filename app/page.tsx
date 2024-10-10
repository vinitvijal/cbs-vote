'use client'
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import sscbs from '@/app/sscbs.jpg'

export default function Component() {
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isFormValid, setIsFormValid] = useState(false)

  useEffect(() => {
    const isEmailValid = email.endsWith("@sscbs.du.ac.in")
    const isPasswordValid = password.length > 5
    setIsFormValid(!!role && isEmailValid && isPasswordValid)
  }, [role, email, password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      // Handle form submission
      console.log("Form submitted", { role, email, password })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 relative w-24 h-24 sm:w-32 sm:h-32">
            <Image
              src={sscbs}
              alt="College Logo"
              layout="fill"
              objectFit="contain"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Shaheed Sukhdev College of Business Studies</CardTitle>
          <CardDescription className="text-sm sm:text-base">College Election System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setRole('voter')}
              variant={role === 'voter' ? 'default' : 'outline'}
              className="text-xs sm:text-sm"
            >
              Voter
            </Button>
            <Button
              onClick={() => setRole('moderator')}
              variant={role === 'moderator' ? 'default' : 'outline'}
              className="text-xs sm:text-sm"
            >
              Moderator
            </Button>
            <Button
              onClick={() => setRole('admin')}
              variant={role === 'admin' ? 'default' : 'outline'}
              className="text-xs sm:text-sm"
            >
              Admin
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@sscbs.du.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && !email.endsWith("@sscbs.du.ac.in") && (
                <p className="text-red-500 text-xs mt-1">Email must end with @sscbs.du.ac.in</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!isFormValid}>
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}