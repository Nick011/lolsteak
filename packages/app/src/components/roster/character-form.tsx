'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import {
  WOW_CLASSES,
  WOW_ROLES,
  WOW_CLASS_SPECS,
  formatClassName,
  getClassColor,
} from '~/lib/wow-constants'

interface Character {
  id: string
  name: string
  realm?: string | null
  class?: string | null
  spec?: string | null
  role?: string | null
  level?: number | null
  isMain?: boolean
}

interface CharacterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  character?: Character | null
  onSubmit: (data: CharacterFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export interface CharacterFormData {
  name: string
  realm?: string
  class?: string
  spec?: string
  role?: string
  level?: number
  isMain?: boolean
}

export function CharacterForm({
  open,
  onOpenChange,
  character,
  onSubmit,
  isSubmitting = false,
}: CharacterFormProps) {
  const [formData, setFormData] = useState<CharacterFormData>({
    name: character?.name || '',
    realm: character?.realm || '',
    class: character?.class || undefined,
    spec: character?.spec || '',
    role: character?.role || undefined,
    level: character?.level || undefined,
    isMain: character?.isMain || false,
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof CharacterFormData, string>>
  >({})

  // Get available specs for selected class
  const availableSpecs = formData.class
    ? WOW_CLASS_SPECS[formData.class] || []
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    const newErrors: Partial<Record<keyof CharacterFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Character name is required'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (formData.level !== undefined) {
      if (formData.level < 1) {
        newErrors.level = 'Level must be at least 1'
      } else if (formData.level > 80) {
        newErrors.level = 'Level must be 80 or less'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    await onSubmit(formData)
  }

  const handleFieldChange = <K extends keyof CharacterFormData>(
    field: K,
    value: CharacterFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Reset spec when class changes
  const handleClassChange = (value: string) => {
    handleFieldChange('class', value)
    handleFieldChange('spec', '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-slate-100">
              {character ? 'Edit Character' : 'Add Character'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {character
                ? 'Update your character information'
                : 'Add a new character to your roster'}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 py-4"
          >
            {/* Character Name */}
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-200">
                Character Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleFieldChange('name', e.target.value)}
                placeholder="Arthas"
                className={`bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 ${
                  errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''
                }`}
              />
              {errors.name && (
                <p className="text-sm text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Realm */}
            <div className="grid gap-2">
              <Label htmlFor="realm" className="text-slate-200">
                Realm
              </Label>
              <Input
                id="realm"
                value={formData.realm}
                onChange={e => handleFieldChange('realm', e.target.value)}
                placeholder="Azeroth"
                className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
              />
            </div>

            {/* Class */}
            <div className="grid gap-2">
              <Label htmlFor="class" className="text-slate-200">
                Class
              </Label>
              <Select value={formData.class} onValueChange={handleClassChange}>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select a class">
                    {formData.class && (
                      <span className="flex items-center gap-2">
                        <Badge
                          className={`${getClassColor(formData.class)} text-xs`}
                        >
                          {formatClassName(formData.class)}
                        </Badge>
                      </span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {WOW_CLASSES.map(wowClass => (
                    <SelectItem key={wowClass.value} value={wowClass.value}>
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${getClassColor(wowClass.value).split(' ')[0]}`}
                        />
                        {wowClass.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Spec */}
            <div className="grid gap-2">
              <Label htmlFor="spec" className="text-slate-200">
                Specialization
              </Label>
              {formData.class && availableSpecs.length > 0 ? (
                <Select
                  value={formData.spec}
                  onValueChange={value => handleFieldChange('spec', value)}
                >
                  <SelectTrigger id="spec">
                    <SelectValue placeholder="Select a spec" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSpecs.map(spec => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="spec"
                  value={formData.spec}
                  onChange={e => handleFieldChange('spec', e.target.value)}
                  placeholder="Select a class first"
                  disabled={!formData.class}
                  className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
              )}
            </div>

            {/* Role */}
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-slate-200">
                Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={value => handleFieldChange('role', value)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {WOW_ROLES.map(wowRole => (
                    <SelectItem key={wowRole.value} value={wowRole.value}>
                      {wowRole.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level */}
            <div className="grid gap-2">
              <Label htmlFor="level" className="text-slate-200">
                Level
              </Label>
              <Input
                id="level"
                type="number"
                min="1"
                max="80"
                value={formData.level ?? ''}
                onChange={e => {
                  const value = e.target.value
                    ? parseInt(e.target.value, 10)
                    : undefined
                  handleFieldChange('level', value)
                }}
                placeholder="80"
                className={`bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 ${
                  errors.level
                    ? 'border-red-500 focus-visible:ring-red-500'
                    : ''
                }`}
              />
              {errors.level && (
                <p className="text-sm text-red-400 mt-1">{errors.level}</p>
              )}
            </div>

            {/* Set as Main */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isMain"
                checked={formData.isMain}
                onChange={e => handleFieldChange('isMain', e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              />
              <Label
                htmlFor="isMain"
                className="text-slate-200 cursor-pointer select-none"
              >
                Set as Main Character
              </Label>
            </div>
          </motion.div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isSubmitting
                ? 'Saving...'
                : character
                  ? 'Update'
                  : 'Add Character'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
