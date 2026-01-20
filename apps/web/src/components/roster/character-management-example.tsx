'use client'

/**
 * Example usage of Character Management Components
 *
 * This file demonstrates how to use CharacterForm and CharacterCard
 * with tRPC for character CRUD operations.
 */

import { useState } from 'react'
import {
  CharacterForm,
  CharacterCard,
  type CharacterFormData,
} from '~/components/roster'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
// import { api } from '~/trpc/react' // Uncomment when using in a real page

export function CharacterManagementExample() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<any>(null)

  // Example: Fetch characters from tRPC
  // const { data: characters, isLoading } = api.character.list.useQuery()

  // Example: Create character mutation
  // const createCharacter = api.character.create.useMutation({
  //   onSuccess: () => {
  //     setIsFormOpen(false)
  //     // Optionally refetch or invalidate query
  //   },
  // })

  // Example: Update character mutation
  // const updateCharacter = api.character.update.useMutation({
  //   onSuccess: () => {
  //     setIsFormOpen(false)
  //     setEditingCharacter(null)
  //   },
  // })

  // Example: Delete character mutation
  // const deleteCharacter = api.character.delete.useMutation()

  // Mock data for demonstration
  const characters = [
    {
      id: '1',
      name: 'Arthas',
      realm: 'Icecrown',
      class: 'death_knight',
      spec: 'Unholy',
      role: 'dps',
      level: 80,
      isMain: true,
      memberId: 'current-user-id',
    },
    {
      id: '2',
      name: 'Jaina',
      realm: 'Dalaran',
      class: 'mage',
      spec: 'Frost',
      role: 'dps',
      level: 80,
      isMain: false,
      memberId: 'current-user-id',
    },
  ]

  const handleSubmit = async (data: CharacterFormData) => {
    try {
      if (editingCharacter) {
        // Update existing character
        // await updateCharacter.mutateAsync({
        //   id: editingCharacter.id,
        //   ...data,
        // })
        console.log('Update character:', data)
      } else {
        // Create new character
        // await createCharacter.mutateAsync(data)
        console.log('Create character:', data)
      }

      setIsFormOpen(false)
      setEditingCharacter(null)
    } catch (error) {
      console.error('Error submitting character:', error)
    }
  }

  const handleEdit = (character: any) => {
    setEditingCharacter(character)
    setIsFormOpen(true)
  }

  const handleDelete = async (characterId: string) => {
    if (!confirm('Are you sure you want to delete this character?')) {
      return
    }

    try {
      // await deleteCharacter.mutateAsync({ id: characterId })
      console.log('Delete character:', characterId)
    } catch (error) {
      console.error('Error deleting character:', error)
    }
  }

  const handleAddNew = () => {
    setEditingCharacter(null)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">My Characters</h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your World of Warcraft characters
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Character
        </Button>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            currentMemberId="current-user-id"
            canEdit={true}
            canDelete={true}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Character Form Dialog */}
      <CharacterForm
        open={isFormOpen}
        onOpenChange={open => {
          setIsFormOpen(open)
          if (!open) {
            setEditingCharacter(null)
          }
        }}
        character={editingCharacter}
        onSubmit={handleSubmit}
        // isSubmitting={createCharacter.isPending || updateCharacter.isPending}
      />
    </div>
  )
}
