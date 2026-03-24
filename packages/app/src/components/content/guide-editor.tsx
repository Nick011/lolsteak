'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Eye } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Badge } from '~/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

interface GuideEditorProps {
 initialData?: GuideFormData
 onSave: (data: GuideFormData) => void
 onCancel: () => void
 isSaving?: boolean
}

export type GuideCategory = 'raid_strats' | 'class_guides' | 'pvp' | 'professions' | 'general'

export interface GuideFormData {
 title: string
 slug: string
 excerpt: string
 content: string
 category: GuideCategory
 tags: string[]
 published: boolean
}

const categories = [
  { value: 'raid_strats', label: 'Raid Strategies' },
  { value: 'class_guides', label: 'Class Guides' },
  { value: 'pvp', label: 'PvP' },
  { value: 'professions', label: 'Professions' },
  { value: 'general', label: 'General' },
]

export function GuideEditor({
  initialData,
  onSave,
  onCancel,
  isSaving = false,
}: GuideEditorProps) {
  const [formData, setFormData] = useState<GuideFormData>(
    initialData || {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'general',
      tags: [],
      published: false,
    }
  )
  const [tagInput, setTagInput] = useState('')

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      // Auto-generate slug only if it's a new guide or slug hasn't been manually edited
      slug: initialData ? prev.slug : generateSlug(title),
    }))
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {initialData ? 'Edit Guide' : 'Create New Guide'}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Guide'}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Enter guide title..."
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={e =>
                  setFormData(prev => ({ ...prev, slug: e.target.value }))
                }
                placeholder="guide-url-slug"
                required
              />
              <p className="text-xs text-slate-500">
                URL: /dashboard/guides/{formData.slug || 'guide-url-slug'}
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={e =>
                  setFormData(prev => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief summary of the guide..."
                rows={3}
              />
              <p className="text-xs text-slate-500">
                Short description shown in guide cards
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
 <Select
 value={formData.category}
 onValueChange={(value: GuideCategory) =>
 setFormData(prev => ({ ...prev, category: value }))
 }
 >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  placeholder="Add a tag..."
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Content with Preview */}
            <div className="space-y-2">
              <Label htmlFor="content">Content * (Markdown)</Label>
              <Tabs defaultValue="write" className="w-full">
                <TabsList>
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-2">
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Write your guide content in markdown..."
                    rows={20}
                    className="font-mono"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Supports markdown formatting including headers, lists,
                    links, code blocks, and tables
                  </p>
                </TabsContent>
                <TabsContent value="preview" className="mt-2">
                  <div className="border border-slate-700 rounded-lg p-6 min-h-[500px] bg-slate-900/50">
                    {formData.content ? (
                      <div className="prose prose-invert prose-slate max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {formData.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">
                        No content to preview
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Published Checkbox */}
            <div className="flex items-center gap-2 p-4 bg-slate-800/30 rounded-lg">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish guide (make visible to all members)
              </Label>
            </div>
          </CardContent>
        </Card>
      </form>
    </motion.div>
  )
}
