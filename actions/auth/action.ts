'use server'
import { PrismaClient } from "@prisma/client"
import exp from "constants"

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
    const admin = await prisma.admin.findFirst({
      where: {
        email,
        password,
        position: role
      }
    })

    if(admin) {
      await prisma.admin.updateMany({
        where: {
          email,
          position: role
        },
        data: {
          currentToken: crypto.randomUUID()
        }
      })
    const updatedAdmin = await prisma.admin.findFirst({
      where: {
        email,
        position: role
      }
    })
    return updatedAdmin

    }
    return null
  }


export async function getVoter(vid: string) {
  const voter = await prisma.voter.findFirst({
    where: {
      vid
    }
  })
  return voter
}


export async function getCbsStatus() {
  const status = await prisma.status.findFirst(
    {
      where: {
        id: "sscbs"
    }
  }
  )
  if (!status) {
    return false;
  }
  return status.status;
}

export async function changeStatus(status: boolean) {
  const updatedStatus = await prisma.status.update({
    where: {
      id: "sscbs"
    },
    data: {
      status
    }
  })
  return updatedStatus
}