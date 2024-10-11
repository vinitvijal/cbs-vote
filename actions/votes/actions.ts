'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


export async function Candidates() {
  const candidates = await prisma.candidate.findMany()
  return candidates
}

export async function getVoters() {
  const voters = await prisma.voter.findMany()
  return voters
}


export async function Voting(votes: Record<string, string>, vid: string) {
  const voter = await prisma.voter.findFirst({
    where: {
      vid
    }
  })

  if(voter?.voted) {
    return false
  }

  const positions = Object.keys(votes)
  for (const position of positions) {
    const candidateId = votes[position]
    await prisma.votes.create({
      data: {
        cid: candidateId,
        position,
        vid
      }
    })
  }

  await prisma.voter.update({
    where: {
      vid
    },
    data: {
      voted: true
    }
  })

  return true
}