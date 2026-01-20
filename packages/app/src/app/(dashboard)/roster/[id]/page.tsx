import { notFound, redirect } from 'next/navigation'
import { auth } from '~/lib/auth'
import { trpc } from '~/lib/trpc/client'
import { MemberProfileClient } from './member-profile-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MemberProfilePage({ params }: PageProps) {
  const session = await auth()
  const { id } = await params

  if (!session) {
    redirect('/auth/signin')
  }

  // TODO: Replace with actual tRPC query when member router is implemented
  // const member = await trpc.member.get.query({ id })

  // Mock data for development
  const member = {
    id,
    name: 'Example Member',
    nickname: 'Epic Player',
    avatar: null,
    joinedAt: new Date('2024-01-15'),
    rank: 'Member',
    roles: [
      { id: '1', name: 'Raider', color: 'purple', permissions: [] },
      { id: '2', name: 'DPS', color: 'red', permissions: [] },
    ],
    characters: [
      {
        id: '1',
        name: 'Darkblade',
        class: 'Death Knight',
        level: 80,
        itemLevel: 489,
        isMain: true,
        realm: 'Area 52',
      },
      {
        id: '2',
        name: 'Healzor',
        class: 'Priest',
        level: 80,
        itemLevel: 476,
        isMain: false,
        realm: 'Area 52',
      },
      {
        id: '3',
        name: 'Tankmode',
        class: 'Warrior',
        level: 78,
        itemLevel: 450,
        isMain: false,
        realm: 'Area 52',
      },
    ],
    stats: {
      raidsAttended: 42,
      totalRaids: 50,
      lootReceived: 15,
      dkpBalance: 1250,
    },
    notes: 'Reliable raider, always prepared',
  }

  if (!member) {
    notFound()
  }

  // Check if current user is an officer
  // TODO: Replace with actual permission check
  const isOfficer = true // Mock for now

  return <MemberProfileClient member={member} isOfficer={isOfficer} />
}
