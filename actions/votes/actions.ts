'use server'
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()


export async function Candidates() {
  const candidates = await prisma.candidate.findMany()
  return candidates
}