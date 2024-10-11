'use client'
import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { ChevronDown, ChevronUp, Menu } from "lucide-react"
import sscbs from "@/app/sscbs.jpg"
import { Voter } from "@prisma/client"
import { getVoters } from "@/actions/votes/actions"
import { toast } from "sonner"
import { ReloadIcon } from "@radix-ui/react-icons"

  
  interface SortConfig {
    key: keyof Voter | null
    direction: 'ascending' | 'descending'
  }





const resultsData = [
    { 
      position: "President", 
      candidates: [
        { name: "Alice Johnson", votes: 250 },
        { name: "Bob Williams", votes: 200 },
        { name: "Charlie Brown", votes: 150 }
      ]
    },
    {
      position: "Vice President",
      candidates: [
        { name: "Diana Clark", votes: 220 },
        { name: "Ethan Davis", votes: 180 }
      ]
    },
    {
      position: "Cultural Head",
      candidates: [
        { name: "Fiona Green", votes: 190 },
        { name: "George White", votes: 170 },
        { name: "Hannah Lee", votes: 140 }
      ]
    }
  ]

const colorPalette = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c']

export default function AdminDashboard() {
  const [students, setStudents] = useState<Voter[] | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'ascending' })


  useEffect(() => {
    
    fetchStudents()
  }, [])

  async function fetchStudents() {
    toast.info('Fetching students data...')
    const res = await getVoters();
    toast.success('Students data fetched successfully')
    console.log("data get", res);
    setStudents(res)
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
            <Button variant="ghost">Home</Button>
            <Button variant="ghost">Settings</Button>
            <Button variant="ghost">Logout</Button>
          </div>
          <div className="md:hidden">
            <Button variant="ghost" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-2 space-y-2">
              <Button variant="ghost" className="w-full justify-start">Home</Button>
              <Button variant="ghost" className="w-full justify-start">Settings</Button>
              <Button variant="ghost" className="w-full justify-start">Logout</Button>
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
                        {students?.filter((v)=> v.por !== "CR").map((e)=>e.society).filter((value, index, currentVal)=> currentVal.indexOf(value) === index).map((society) => (
                          <TableRow key={society}>
                            <TableCell>{society}</TableCell>
                            <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === society).filter((e)=>e.por === "President")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === society).filter((e)=>e.por === "President")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e)=>e.society === society).filter((e)=>e.por === "President")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === society).filter((e)=>e.por === "Vice President")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === society).filter((e)=>e.por === "Vice President")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                            {students?.filter((e)=>e.society === society).filter((e)=>e.por === "Vice President")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[0]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[0]?.voted === false && 'bg-red-100 text-red-800'}`}>
                            {students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[1]?.voted ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[1]?.voted === false && 'bg-red-100 text-red-800'}`}>
                                {students?.filter((e)=>e.society === society).filter((e)=>e.por === "Coordinator")[1]?.name}
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
                      {students?.filter((v)=> v.por === "CR").map((e)=>e.society).filter((value, index, currentVal)=> currentVal.indexOf(value) === index).map((course) => (                         
                        <TableRow key={course}>
                            <TableCell>{course}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[0]?.voted === true ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[0]?.voted === false ? 'bg-red-100 text-red-800' : ''}`}>
                              {students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[0]?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[1]?.voted === true ? 'bg-green-100 text-green-800' : students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[1]?.voted === false ? 'bg-red-100 text-red-800' : ''}`}>
                            {students?.filter((e)=>e.society === course).filter((e)=>e.por === "CR")[1]?.name}
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
                          {resultsData.flatMap((result) => 
                            result.candidates.map((candidate, index) => (
                              <TableRow key={`${result.position}-${candidate.name}`}>
                                {index === 0 && <TableCell rowSpan={result.candidates.length}>{result.position}</TableCell>}
                                <TableCell>{candidate.name}</TableCell>
                                <TableCell>{candidate.votes}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Voting Distribution</h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={resultsData.flatMap(result => 
                          result.candidates.map(candidate => ({
                            position: result.position,
                            candidate: candidate.name,
                            votes: candidate.votes
                          }))
                        )}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="position" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {resultsData.map((result, index) => (
                          <Bar
                            key={index}
                            dataKey="votes"
                            fill={colorPalette[index % colorPalette.length]}
                            name={result.position}
                          >
                            {result.candidates.map((candidate, candidateIndex) => (
                              <Cell
                                key={`cell-${index}-${candidateIndex}`}
                                fill={colorPalette[(index + candidateIndex) % colorPalette.length]}
                              />
                            ))}
                          </Bar>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {resultsData.map((result, index) => (
                        <div key={index} className="text-sm">
                          <strong>{result.position}:</strong>
                          {result.candidates.map((candidate, candidateIndex) => (
                            <div key={candidateIndex} className="flex items-center">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: colorPalette[(index + candidateIndex) % colorPalette.length] }}
                              ></span>
                              {candidate.name}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}