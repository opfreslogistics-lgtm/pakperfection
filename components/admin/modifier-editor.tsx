'use client'

import { Plus, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface ModifierEditorProps {
  modifier: any
  onUpdate: (modifier: any) => void
  onDelete: () => void
}

export default function ModifierEditor({ modifier, onUpdate, onDelete }: ModifierEditorProps) {
  const updateField = (field: string, value: any) => {
    onUpdate({ ...modifier, [field]: value })
  }

  const addOption = () => {
    const options = modifier.options || []
    onUpdate({
      ...modifier,
      options: [...options, {
        id: Date.now().toString(),
        name: '',
        price_modifier: '0.00',
        is_default: false,
        order_index: options.length
      }]
    })
  }

  const updateOption = (index: number, field: string, value: any) => {
    const options = [...(modifier.options || [])]
    options[index] = { ...options[index], [field]: value }
    onUpdate({ ...modifier, options })
  }

  const deleteOption = (index: number) => {
    const options = modifier.options.filter((_: any, i: number) => i !== index)
    onUpdate({ ...modifier, options })
  }

  return (
    <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 space-y-3">
          <div>
            <label className="block mb-2 font-semibold">Customization Group Name *</label>
            <input
              type="text"
              placeholder="e.g., Protein Choice"
              value={modifier.group_name || ''}
              onChange={(e) => updateField('group_name', e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modifier.is_required || false}
                onChange={(e) => updateField('is_required', e.target.checked)}
                className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600"
              />
              <span className="font-semibold">Required *</span>
            </label>
            <div className="flex gap-2 items-center">
              <label className="font-semibold">Max Selections:</label>
              <input
                type="number"
                min="1"
                value={modifier.max_selections || 1}
                onChange={(e) => updateField('max_selections', parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="ml-4 text-red-600 hover:text-red-700 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="font-semibold">Options:</label>
          <button
            type="button"
            onClick={addOption}
            className="bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Option
          </button>
        </div>
        {(modifier.options || []).map((option: any, optIndex: number) => (
          <div key={option.id || optIndex} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-300 dark:border-gray-600">
            <div className="flex gap-3 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  placeholder="Option Name (e.g., Beef, Goat, Chicken)"
                  value={option.name || ''}
                  onChange={(e) => updateOption(optIndex, 'name', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <div className="flex gap-2 items-center">
                  <label className="text-sm font-semibold">Price Modifier:</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={option.price_modifier || '0.00'}
                    onChange={(e) => updateOption(optIndex, 'price_modifier', e.target.value)}
                    className="w-32 px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {option.price_modifier && parseFloat(option.price_modifier) !== 0 && (
                      <span className={parseFloat(option.price_modifier) > 0 ? 'text-green-600' : 'text-red-600'}>
                        ({parseFloat(option.price_modifier) > 0 ? '+' : ''}{formatPrice(parseFloat(option.price_modifier))})
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteOption(optIndex)}
                className="text-red-600 hover:text-red-700 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {(!modifier.options || modifier.options.length === 0) && (
          <p className="text-sm text-gray-500 text-center py-4">No options added. Click "Add Option" to create one.</p>
        )}
      </div>
    </div>
  )
}





