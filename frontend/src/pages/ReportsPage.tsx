import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  Loader2,
  Package,
} from 'lucide-react'
import { reportsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

type Period = 'week' | 'month' | 'quarter' | 'year'

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>('month')

  // Calculate date range based on period
  const dateRange = useMemo(() => {
    const now = new Date()
    let from: Date
    let to: Date = new Date(now)

    switch (period) {
      case 'week':
        from = new Date(now)
        from.setDate(now.getDate() - 7)
        break
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        from = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        from = new Date(now.getFullYear(), 0, 1)
        break
      default:
        from = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return {
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
    }
  }, [period])

  // Fetch reports data from API
  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ['reports', dateRange.from, dateRange.to],
    queryFn: () => reportsApi.get(dateRange.from, dateRange.to),
  })

  const stats = reportsData?.stats ?? {
    totalOrders: 0,
    totalAmount: '0',
    averageOrder: '0',
    savings: '0',
  }

  const monthlyData = reportsData?.monthlyData ?? []
  const topProducts = reportsData?.topProducts ?? []
  const hotelPerformance = reportsData?.hotelPerformance ?? []

  const statsCards = [
    {
      label: 'Celkem objednávek',
      value: stats.totalOrders.toString(),
      sublabel: 'za vybrané období',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Celková hodnota',
      value: formatCurrency(stats.totalAmount),
      sublabel: 'za vybrané období',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Průměrná objednávka',
      value: formatCurrency(stats.averageOrder),
      sublabel: 'na objednávku',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Úspora',
      value: formatCurrency(stats.savings),
      sublabel: 'díky centrálnímu nákupu',
      icon: PiggyBank,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  const formatDateRange = () => {
    const fromDate = new Date(dateRange.from)
    const toDate = new Date(dateRange.to)
    return {
      from: formatDate(fromDate),
      to: formatDate(toDate),
    }
  }

  const dateRangeFormatted = formatDateRange()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporty</h1>
          <p className="text-gray-500">Analýza nákupů a výkonnosti</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2" disabled>
            <FileText className="h-4 w-4" /> PDF Report
          </Button>
          <Button className="bg-secondary text-secondary-foreground gap-2" disabled>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
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
          <span>{dateRangeFormatted.from}</span>
          <span>—</span>
          <span>{dateRangeFormatted.to}</span>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-gray-500">
          <p>Nepodařilo se načíst reporty</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat) => (
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

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Měsíční přehled</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Žádná data</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyData.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.month || item.label || `Měsíc ${index + 1}`}</p>
                          <p className="text-sm text-gray-500">{item.orders || 0} objednávek</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(item.amount || '0')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top produkty</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Žádná data</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((product: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{product.name || product.productName || `Produkt ${index + 1}`}</p>
                            <p className="text-sm text-gray-500">{product.quantity || product.count || 0}x</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(product.total || product.amount || '0')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Hotel performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Výkonnost hotelů</CardTitle>
            </CardHeader>
            <CardContent>
              {hotelPerformance.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Žádná data</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hotel</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Objednávky</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Celková hodnota</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Průměrná objednávka</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotelPerformance.map((hotel: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">{hotel.name || hotel.branchName || `Hotel ${index + 1}`}</p>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{hotel.orders || hotel.orderCount || 0}</td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatCurrency(hotel.total || hotel.totalAmount || '0')}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatCurrency(hotel.average || hotel.averageOrder || '0')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
