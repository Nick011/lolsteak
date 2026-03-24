'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Card } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

interface FaqItem {
  id: string
  question: string
  answer: string
  categoryId: string
  order: number
}

interface FaqCategory {
  id: string
  name: string
  slug: string
  order: number
  items?: FaqItem[]
}

interface FaqAccordionProps {
  categories: FaqCategory[]
  searchQuery?: string
}

export function FaqAccordion({
  categories,
  searchQuery = '',
}: FaqAccordionProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    categories[0]?.id ?? null
  )
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  const filteredCategories = categories
    .map(category => ({
      ...category,
      items:
        category.items?.filter(
          item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ) ?? [],
    }))
    .filter(category => category.items.length > 0)

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
    setExpandedItem(null)
  }

  const toggleItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId)
  }

  if (filteredCategories.length === 0) {
    return (
      <Card className="p-12 text-center" variant="glass">
        <HelpCircle className="h-12 w-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-400 mb-2">
          No Results Found
        </h3>
        <p className="text-slate-500">
          Try adjusting your search or browse all categories
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {filteredCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: categoryIndex * 0.05 },
          }}
        >
          <Card variant="elevated" className="overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {category.name}
                </h3>
                <Badge variant="secondary" size="sm">
                  {category.items?.length ?? 0}
                </Badge>
              </div>
              <motion.div
                animate={{
                  rotate: expandedCategory === category.id ? 180 : 0,
                }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-slate-400" />
              </motion.div>
            </button>

            {/* Category Items */}
            <AnimatePresence>
              {expandedCategory === category.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-slate-700/50"
                >
                  <div className="divide-y divide-slate-700/50">
                    {category.items?.map(item => (
                      <div key={item.id}>
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="w-full px-6 py-4 text-left hover:bg-slate-800/20 transition-colors flex items-start gap-3"
                        >
                          <motion.div
                            animate={{
                              rotate: expandedItem === item.id ? 90 : 0,
                            }}
                            transition={{ duration: 0.2 }}
                            className="mt-0.5"
                          >
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          </motion.div>
                          <div className="flex-1">
                            <p className="text-slate-200 font-medium">
                              {item.question}
                            </p>
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedItem === item.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-4 pl-16">
                                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
