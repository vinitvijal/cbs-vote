-- CreateTable
CREATE TABLE "Voter" (
    "vid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "society" TEXT NOT NULL,
    "por" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL,
    "voted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voter_pkey" PRIMARY KEY ("vid")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "cid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rollno" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("cid")
);

-- CreateTable
CREATE TABLE "Votes" (
    "vid" TEXT NOT NULL,
    "cid" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Votes_pkey" PRIMARY KEY ("vid","cid")
);
