'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function VoterLogin(email: string, password: string) {
  const voter = await prisma.voter.findFirst({
    where: {
      email,
      password
    }
  })
  return voter
}

export async function SuperLogin(email: string, password: string, role: string) {
    const voter = await prisma.admin.findFirst({
      where: {
        email,
        password,
        position: role
      }
    })

    if(voter) {
      const updatedVoter = await prisma.admin.updateMany({
        where: {
          email
        },
        data: {
          currentToken: crypto.randomUUID()
        }
      })
    }
    return voter
  }