import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  X,
  Loader2,
  Plus,
} from 'lucide-react'

interface AddSupplierModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddSupplierModal({ isOpen, onClose }: AddSupplierModalProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [apiEndpoint, setApiEndpoint] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Create supplier mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; category?: string; apiEndpoint?: string }) =>
      suppliersApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Dodavatel vytvořen',
        description: 'Dodavatel byl úspěšně přidán.',
      })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      handleClose()
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se vytvořit dodavatele',
        variant: 'destructive',
      })
    },
  })

  const handleClose = () => {
    setName('')
    setCategory('')
    setApiEndpoint('')
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast({
        title: 'Chyba',
        description: 'Název dodavatele je povinný',
        variant: 'destructive',
      })
      return
    }

    createMutation.mutate({
      name: name.trim(),
      category: category.trim() || undefined,
      apiEndpoint: apiEndpoint.trim() || undefined,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Přidat dodavatele</h2>
              <p className="text-sm text-gray-500">Vyplňte údaje o novém dodavateli</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="h-10 w-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název dodavatele <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Např. Fresh Foods s.r.o."
                required
                disabled={createMutation.isPending}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <Input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Např. Potraviny & Nápoje"
                disabled={createMutation.isPending}
              />
            </div>

            {/* API Endpoint */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Endpoint
              </label>
              <Input
                type="url"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.example.com/products"
                disabled={createMutation.isPending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Volitelné. URL endpointu pro synchronizaci produktů.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Zrušit
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Vytvářím...
                </>
              ) : (
                'Vytvořit dodavatele'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
