import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PiggyBank,
  FileText,
  Download,
  Calendar,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function ReportsPage() {
  const [period, setPeriod] = useState('month')
  const [dateRange] = useState({ from: '1. 1. 2026', to: '31. 1. 2026' })

  const stats = [
    {
      label: 'Celkem objednávek',
      value: '0',
      sublabel: 'za vybrané období',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Celková hodnota',
      value: '0 Kč',
      sublabel: 'za vybrané období',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Průměrná objednávka',
      value: '0 Kč',
      sublabel: 'na objednávku',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Úspora',
      value: '0 Kč',
      sublabel: 'díky centrálnímu nákupu',
      icon: PiggyBank,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporty</h1>
          <p className="text-gray-500">Analýza nákupů a výkonnosti</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> PDF Report
          </Button>
          <Button className="bg-secondary text-secondary-foreground gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Tento týden</SelectItem>
            <SelectItem value="month">Tento měsíc</SelectItem>
            <SelectItem value="quarter">Toto čtvrtletí</SelectItem>
            <SelectItem value="year">Tento rok</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{dateRange.from}</span>
          <span>—</span>
          <span>{dateRange.to}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm text-gray-500">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.sublabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Měsíční přehled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Žádná data
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top produkty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Žádná data
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Výkonnost hotelů</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Žádná data
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
