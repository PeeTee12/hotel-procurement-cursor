import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { shipmentsApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Loader2, Save } from 'lucide-react'

interface EditShipmentModalProps {
  shipment: {
    id: number
    trackingNumber: string | null
  } | null
  isOpen: boolean
  onClose: () => void
}

export default function EditShipmentModal({ shipment, isOpen, onClose }: EditShipmentModalProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [trackingNumber, setTrackingNumber] = useState('')

  useEffect(() => {
    if (shipment) {
      setTrackingNumber(shipment.trackingNumber || '')
    }
  }, [shipment])

  const updateMutation = useMutation({
    mutationFn: (data: { trackingNumber?: string | null }) =>
      shipmentsApi.update(shipment!.id, data),
    onSuccess: () => {
      toast({
        title: 'Zásilka aktualizována',
        description: 'Informace o zásilce byly úspěšně aktualizovány.',
      })
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      onClose()
    },
    onError: (error: Error) => {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodařilo se aktualizovat zásilku',
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipment) return

    updateMutation.mutate({
      trackingNumber: trackingNumber.trim() || null,
    })
  }

  if (!isOpen || !shipment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Upravit zásilku</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={updateMutation.isPending}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sledovací číslo
            </label>
            <Input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Např. TR123456789"
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateMutation.isPending}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="bg-primary">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Uložit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
