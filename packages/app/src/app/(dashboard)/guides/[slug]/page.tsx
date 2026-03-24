'use client'

import React, { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  GuideContent,
  GuideEditor,
  type GuideFormData,
} from '~/components/content'
import { Button } from '~/components/ui/button'
import { trpc } from '~/lib/trpc/client'

interface GuideDetailPageProps {
  params: Promise<{ slug: string }>
}

export default function GuideDetailPage({ params }: GuideDetailPageProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const resolvedParams = use(params)

  const { data: guide, isLoading } = trpc.content.guideBySlug.useQuery({
    slug: resolvedParams.slug,
  })

  const updateGuideMutation = trpc.content.updateGuide.useMutation()

  const handleEdit = () => {
    setIsEditing(true)
  }

const handleSave = async (data: GuideFormData) => {
 if (!guide) return

 try {
 await updateGuideMutation.mutateAsync({
 id: guide.id,
 title: data.title,
 slug: data.slug,
 excerpt: data.excerpt,
 content: data.content,
 category: data.category,
 tags: data.tags,
 isPublished: data.published,
 })
 setIsEditing(false)
 } catch (error) {
 console.error('Failed to update guide:', error)
 }
 }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/4" />
          <div className="h-12 bg-slate-700 rounded w-3/4" />
          <div className="h-4 bg-slate-700 rounded w-1/2" />
          <div className="h-64 bg-slate-700 rounded" />
        </div>
      </div>
    )
  }

if (!guide) {
 return (
 <div className="p-6 space-y-6 max-w-4xl mx-auto">
 <div className="text-center py-12">
 <h2 className="text-2xl font-bold text-white mb-2">
 Guide Not Found
 </h2>
 <p className="text-slate-400 mb-6">
 The guide you're looking for doesn't exist or has been removed.
 </p>
 <Button onClick={() => router.push('/dashboard/guides')}>
 <ArrowLeft className="h-4 w-4 mr-2" />
 Back to Guides
 </Button>
 </div>
 </div>
 )
 }

 // Destructure guide with null fallbacks
 const {
 title,
 slug,
 excerpt,
 content,
 category,
 tags,
 isPublished,
 author,
 createdAt,
 updatedAt,
 viewCount,
 } = guide

 const safeTags = tags ?? []
 const authorName = author?.user?.name || author?.user?.email || 'Unknown'

 return (
 <div className="p-6 space-y-6">
 {/* Back Button */}
 {!isEditing && (
 <Button
 variant="ghost"
 size="sm"
 onClick={() => router.push('/dashboard/guides')}
 >
 <ArrowLeft className="h-4 w-4 mr-2" />
 Back to Guides
 </Button>
 )}

 {/* Content or Editor */}
 {isEditing ? (
 <GuideEditor
 initialData={{
 title,
 slug,
 excerpt: excerpt || '',
 content,
 category,
 tags: safeTags,
 published: isPublished,
 }}
 onSave={handleSave}
 onCancel={handleCancel}
 isSaving={updateGuideMutation.isPending}
 />
 ) : (
 <GuideContent
 title={title}
 category={category}
 tags={safeTags}
 content={content}
 authorName={authorName}
 createdAt={createdAt}
 updatedAt={updatedAt}
 viewCount={viewCount}
 canEdit={true} // TODO: Add permission check
 onEdit={handleEdit}
 />
 )}
 </div>
 )
}
