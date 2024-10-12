'use client'
import { useCallback, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Menu } from "lucide-react"
import sscbs from "@/app/sscbs.jpg"
import { Candidate as RealCand, Voter, Votes } from "@prisma/client"
import { Candidates, getVoters, getVotes } from "@/actions/votes/actions"
import { toast } from "sonner"
import { ReloadIcon } from "@radix-ui/react-icons"
import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts'
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { changeStatus, getCbsStatus } from "@/actions/auth/action"
import { useRouter } from "next/navigation"


interface SortConfig {
  key: keyof Voter | null
  direction: 'ascending' | 'descending'
}






export default function AdminDashboard() {
  const router = useRouter();
  const [votes, setVotes] = useState<Votes[] | null>(null);
  const [candidates, setCandidates] = useState<RealCand[] | null>(null)
  const [students, setStudents] = useState<Voter[] | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' })
  const [status, setStatus] = useState<boolean>(false)

  useEffect(() => {

    fetchStudents()
  }, [])

  async function fetchStudents() {
    const user = sessionStorage.getItem("user")
    const token = sessionStorage.getItem("token")
    if (!user || !token) {
      toast.error('You are not logged in')
      router.replace('/')
      return
    }
    const role = JSON.parse(user).position
    if (role !== "admin") {
      toast.error('You are not authorized')
      router.replace('/')
      console.log(user)
      return
    }
    toast.info('Fetching students data...')
    const res = await getVoters();
    const stat = await getCbsStatus();
    const cand = await Candidates();
    const vote = await getVotes();
    toast.success('Students data fetched successfully')
    console.log("data get", res);
    setStudents(res)
    setStatus(stat)
    setVotes(vote)
    setCandidates(cand)
  }


  const handleLogout = () => {
    sessionStorage.clear()
    localStorage.clear()
    toast.success('Logged out successfully')
    router.replace('/')
  }

  const handleStatus = async () => {
    toast.info('Changing voting status...')
    const res = await changeStatus(!status);
    setStatus(res.status)
    toast.success('Voting status changed successfully')
  }

  async function Refresh() {
    toast.info('Refreshing data...')
    fetchStudents()
    toast.success('Data refreshed successfully')
  }

  const sortedAttendanceData = useCallback(() => {
    console.log(students)
    if (!students) return []
    // let students = students;
    if (sortConfig.key !== null) {
      students.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return students
  }, [sortConfig, students])

  const requestSort = (key: keyof Voter) => {
    let direction: 'ascending' | 'descending' = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }


  const electionData = useMemo(() => {
    if (!votes || !candidates) return []
    return candidates.map(candidate => ({
      name: candidate.name,
      votes: votes.filter(vote => vote.cid === candidate.cid).length,
      position: candidate.position
    }))
  }, [candidates])

  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F06292', '#AED581', '#7986CB'
  ]

  const CustomTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{data.name}</p>
          <p>{`Position: ${data.position}`}</p>
          <p>{`Votes: ${data.votes}`}</p>
        </div>
      )
    }
    return null
  }
  const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: keyof Voter }> = ({ children, sortKey }) => (
    <TableHead className="cursor-pointer" onClick={() => requestSort(sortKey)}>
      <div className="flex items-center">
        {children}
        {sortConfig.key === sortKey && (
          sortConfig.direction === 'ascending' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
        )}
      </div>
    </TableHead>
  )


  const [selectedPosition, setSelectedPosition] = useState<string>("All Positions")

  const positions = useMemo(() => {
    if (!candidates) return []
    const uniquePositions = candidates?.map(candidate => candidate.position).filter((value, index, self) => self.indexOf(value) === index)
    return ["All Positions", ...uniquePositions]
  }, [candidates])

  const candidateColors = useMemo(() => {
    return electionData.reduce((acc, candidate, index) => {
      acc[candidate.name] = colorPalette[index % colorPalette.length]
      return acc
    }, {} as Record<string, string>)
  }, [candidates, votes])

  const filteredData = useMemo(() => {
    return selectedPosition === "All Positions"
      ? electionData
      : electionData.filter(candidate => candidate.position === selectedPosition)
  }, [selectedPosition])





  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src={sscbs}
              alt="College Logo"
              width={40}
              height={40}
            />
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
          <div className="hidden md:flex space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="airplane-mode" checked={status} onCheckedChange={handleStatus} />
              <Label htmlFor="airplane-mode">Voting Mode</Label>
            </div>
            <Button variant="ghost" onClick={() => { handleLogout() }}>Logout</Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-2 space-y-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" checked={status} onCheckedChange={handleStatus} />
                <Label htmlFor="airplane-mode">Voting Mode</Label>
              </div>
              <Button variant="ghost" className="justify-start" onClick={() => { handleLogout() }}>Logout</Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="attendance" className="space-y-4">
          <span className=" flex justify-between items-center">

            <TabsList>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <ReloadIcon className="h-6 w-6 text-gray-600 cursor-pointer" onClick={() => Refresh()} />
          </span>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Attendance List</CardTitle>
                <CardDescription>View and manage voter attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHeader sortKey="name">Name</SortableHeader>
                        <SortableHeader sortKey="email">Email</SortableHeader>
                        <SortableHeader sortKey="rollno">Roll Number</SortableHeader>
                        <SortableHeader sortKey="society">Class/Society</SortableHeader>
                        <SortableHeader sortKey="attended">Attedance</SortableHeader>
                        <SortableHeader sortKey="voted">Status</SortableHeader>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students && sortedAttendanceData().map((student: Voter) => (
                        <TableRow key={student.vid}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.rollno}</TableCell>
                          <TableCell>{student.society}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.attended ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {student.attended ? 'Present' : 'Absent'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${student.voted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {student.voted ? 'Voted' : 'Not Voted'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Society-wise Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Society</TableHead>
                          <TableHead>President</TableHead>
                          <TableHead>Vice President</TableHead>
                          <TableHead>Coordinator 1</TableHead>
                          <TableHead>Coordinator 2</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students?.filter((v) => v.por !== "CR").map((e) => e.society).filter((value, index, currentVal) => currentVal.indexOf(value) === index).map((society) => (
                          <TableRow key={society}>
                            <TableCell>{society}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === society).filter((e) => e.por === "President")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === society).filter((e) => e.por === "President")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e) => e.society === society).filter((e) => e.por === "President")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === society).filter((e) => e.por === "Vice President")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === society).filter((e) => e.por === "Vice President")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e) => e.society === society).filter((e) => e.por === "Vice President")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[1]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[1]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e) => e.society === society).filter((e) => e.por === "Coordinator")[1]?.name}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>CR-wise Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class</TableHead>
                          <TableHead>CR1</TableHead>
                          <TableHead>CR2</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students?.filter((v) => v.por === "CR").map((e) => e.society).filter((value, index, currentVal) => currentVal.indexOf(value) === index).map((course) => (
                          <TableRow key={course}>
                            <TableCell>{course}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[0]?.voted === true ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[0]?.voted === false ? 'bg-red-100 text-red-800' : ''}`}>
                                {students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[1]?.voted === true ? 'bg-green-100 text-green-800' : students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[1]?.voted === false ? 'bg-red-100 text-red-800' : ''}`}>
                                {students?.filter((e) => e.society === course).filter((e) => e.por === "CR")[1]?.name}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>Position-wise results and graphical representation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Position-wise Results</h3>
                    <ScrollArea className="h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Votes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {candidates && positions.flatMap((position) =>
                            votes && candidates.filter((v) => v.position === position).map((candi, index) => (
                              <TableRow key={`${position}-${candi.name}`}>
                                {index === 0 && <TableCell rowSpan={candidates.filter((v) => v.position === position).length}>{position}</TableCell>}
                                <TableCell>{candi.name}</TableCell>
                                <TableCell>{votes?.filter((v) => v.cid === candi.cid && v.position === position).length || 0}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                  <Card className="w-full max-w-4xl mx-auto">
                    <CardHeader>
                      <CardTitle>Election Results</CardTitle>
                      <CardDescription>Vote distribution for each candidate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Select onValueChange={(value) => setSelectedPosition(value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map((position) => (
                              <SelectItem key={position} value={position}>
                                {position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={filteredData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="votes">
                              {filteredData.map((entry, index) => (
                                <Bar
                                  key={`bar-${index}`}
                                  dataKey="votes"
                                  fill={candidateColors[entry.name]}
                                  name={entry.name}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filteredData.map((candidate, index) => (
                          <div key={index} className="text-sm flex items-center">
                            <span
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                              style={{ backgroundColor: candidateColors[candidate.name] }}
                            ></span>
                            <span className="truncate">{candidate.name}: {candidate.votes} votes</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}