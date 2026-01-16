'use client'

import { useState } from 'react'

const SUGGESTED_TAGS = [
  'korean', 'japanese', 'chinese', 'thai', 'vietnamese', 'italian', 'mexican', 'indian',
  'cafe', 'fast food', 'fine dining',
  'late night', 'breakfast', 'lunch', 'dinner',
  'date night', 'family friendly'
]

interface TagSelectorProps {
  selected: string[]
  onChange: (tags: string[]) => void
}

export default function TagSelector({ selected, onChange }: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  const addCustomTag = () => {
    const tag = customTag.trim().toLowerCase()
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag])
    }
    setCustomTag('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTag()
    }
  }

  const customTags = selected.filter(tag => !SUGGESTED_TAGS.includes(tag))

  return (
    <div className="space-y-3">
      {/* Custom tag input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customTag}
          onChange={e => setCustomTag(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add custom tag..."
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={addCustomTag}
          disabled={!customTag.trim()}
          className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Selected custom tags */}
      {customTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white border border-blue-500 flex items-center gap-1"
            >
              {tag}
              <span className="text-blue-200">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Suggested tags */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_TAGS.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              selected.includes(tag)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
