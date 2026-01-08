import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Palette,
  Building2,
  Users,
  Tag,
  GitBranch,
  Bell,
  Shield,
  Upload,
  Check,
  RotateCcw,
  Save,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

const colorSchemes = [
  { id: 'orea-original', name: 'Orea Original', primary: '#2D4739', secondary: '#C9A227' },
  { id: 'ocean-blue', name: 'Ocean Blue', primary: '#1E40AF', secondary: '#A78BFA' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#7C3AED', secondary: '#F472B6' },
  { id: 'warm-terra', name: 'Warm Terra', primary: '#B45309', secondary: '#FBBF24' },
  { id: 'modern-gray', name: 'Modern Gray', primary: '#374151', secondary: '#F59E0B' },
  { id: 'fresh-mint', name: 'Fresh Mint', primary: '#059669', secondary: '#FBBF24' },
]

const tabs = [
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'organization', label: 'Organizace', icon: Building2 },
  { id: 'users', label: 'Uživatelé', icon: Users },
  { id: 'categories', label: 'Kategorie', icon: Tag },
  { id: 'workflow', label: 'Workflow', icon: GitBranch },
  { id: 'notifications', label: 'Notifikace', icon: Bell },
  { id: 'security', label: 'Zabezpečení', icon: Shield },
]

export default function SettingsPage() {
  const [selectedScheme, setSelectedScheme] = useState('orea-original')
  const [primaryColor, setPrimaryColor] = useState('#2D4739')
  const [secondaryColor, setSecondaryColor] = useState('#C9A227')
  const [appName, setAppName] = useState('ProcureX')
  const [domain, setDomain] = useState('procure.orea.cz')
  const [font, setFont] = useState('Manrope')
  const { toast } = useToast()

  const handleSchemeSelect = (schemeId: string) => {
    const scheme = colorSchemes.find(s => s.id === schemeId)
    if (scheme) {
      setSelectedScheme(schemeId)
      setPrimaryColor(scheme.primary)
      setSecondaryColor(scheme.secondary)
    }
  }

  const handleSave = () => {
    toast({
      title: 'Nastavení uloženo',
      description: 'Vaše změny byly úspěšně uloženy.',
    })
  }

  const handleReset = () => {
    handleSchemeSelect('orea-original')
    setAppName('ProcureX')
    setDomain('procure.orea.cz')
    setFont('Manrope')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nastavení</h1>
        <p className="text-gray-500">Konfigurace platformy a whitelabel nastavení</p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="bg-transparent border-b border-gray-200 rounded-none p-0 h-auto gap-6">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 px-0 gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Whitelabel konfigurace</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo and App Name */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo společnosti
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-2xl font-bold text-gray-400">
                      P
                    </div>
                    <Button variant="outline" className="gap-2">
                      <Upload className="h-4 w-4" /> Nahrát logo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG do 2 MB</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název aplikace
                  </label>
                  <Input
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>

              {/* Color Schemes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Barevná schémata
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {colorSchemes.map((scheme) => (
                    <button
                      key={scheme.id}
                      onClick={() => handleSchemeSelect(scheme.id)}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-center',
                        selectedScheme === scheme.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex justify-center gap-2 mb-2">
                        <div
                          className="h-8 w-8 rounded-lg"
                          style={{ backgroundColor: scheme.primary }}
                        />
                        <div
                          className="h-8 w-8 rounded-lg"
                          style={{ backgroundColor: scheme.secondary }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{scheme.name}</span>
                      {selectedScheme === scheme.id && (
                        <div className="absolute top-2 right-2">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nebo zvolte vlastní barvy
                </label>
                <div className="flex items-center gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Primární</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-lg border"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-28"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sekundární</label>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-10 w-10 rounded-lg border"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-28"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Font and Domain */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Font
                  </label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manrope">Manrope</SelectItem>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vlastní doména
                  </label>
                  <Input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleReset} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Resetovat na výchozí
                </Button>
                <Button onClick={handleSave} className="bg-secondary text-secondary-foreground gap-2">
                  <Save className="h-4 w-4" /> Uložit změny
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs - placeholder content */}
        {tabs.slice(1).map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <tab.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nastavení {tab.label.toLowerCase()} bude brzy k dispozici</p>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
