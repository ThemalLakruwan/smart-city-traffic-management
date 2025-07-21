import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, BarChart3, Settings, Activity, AlertTriangle, Car, Clock, Users, TrendingUp, TrendingDown, Zap, CheckCircle, XCircle } from 'lucide-react'

// TrafficMap Component
const TrafficMap = () => {
  const [selectedIntersection, setSelectedIntersection] = useState(null)

  const intersections = [
    { id: 1, name: 'Main St & 1st Ave', status: 'normal', x: 20, y: 30, vehicles: 15, waitTime: '45s' },
    { id: 2, name: 'Oak St & 2nd Ave', status: 'congested', x: 60, y: 20, vehicles: 28, waitTime: '120s' },
    { id: 3, name: 'Pine St & 3rd Ave', status: 'incident', x: 40, y: 60, vehicles: 8, waitTime: '180s' },
    { id: 4, name: 'Elm St & 4th Ave', status: 'normal', x: 80, y: 70, vehicles: 12, waitTime: '30s' },
    { id: 5, name: 'Cedar St & 5th Ave', status: 'congested', x: 30, y: 80, vehicles: 22, waitTime: '90s' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-500'
      case 'congested': return 'bg-yellow-500'
      case 'incident': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Live Traffic Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-96 overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Street lines */}
          <svg className="absolute inset-0 w-full h-full">
            <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <line x1="10%" y1="60%" x2="90%" y2="60%" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <line x1="20%" y1="10%" x2="20%" y2="90%" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <line x1="60%" y1="10%" x2="60%" y2="90%" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <line x1="80%" y1="10%" x2="80%" y2="90%" stroke="currentColor" strokeWidth="3" opacity="0.3" />
          </svg>

          {/* Intersections */}
          {intersections.map((intersection) => (
            <div
              key={intersection.id}
              className={`absolute w-6 h-6 rounded-full cursor-pointer transition-transform hover:scale-125 ${getStatusColor(intersection.status)} flex items-center justify-center`}
              style={{ left: `${intersection.x}%`, top: `${intersection.y}%` }}
              onClick={() => setSelectedIntersection(intersection)}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          ))}

          {/* Selected intersection info */}
          {selectedIntersection && (
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-3 border">
              <h3 className="font-semibold text-sm">{selectedIntersection.name}</h3>
              <div className="flex items-center gap-4 text-xs mt-2">
                <span className="flex items-center gap-1">
                  <Car className="h-3 w-3" />
                  {selectedIntersection.vehicles} vehicles
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedIntersection.waitTime}
                </span>
              </div>
              <Badge 
                variant={selectedIntersection.status === 'normal' ? 'default' : 
                        selectedIntersection.status === 'congested' ? 'secondary' : 'destructive'}
                className="text-xs mt-2"
              >
                {selectedIntersection.status}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// TrafficStats Component
const TrafficStats = () => {
  const [timeRange, setTimeRange] = useState('24h')

  const statsData = {
    '1h': { avgSpeed: 45, totalVehicles: 1250, incidents: 0, efficiency: 92 },
    '24h': { avgSpeed: 42, totalVehicles: 28500, incidents: 2, efficiency: 87 },
    '7d': { avgSpeed: 38, totalVehicles: 195000, incidents: 12, efficiency: 82 }
  }

  const currentStats = statsData[timeRange]

  const hourlyData = [
    { hour: '00:00', vehicles: 120, speed: 55 },
    { hour: '02:00', vehicles: 80, speed: 58 },
    { hour: '04:00', vehicles: 60, speed: 60 },
    { hour: '06:00', vehicles: 450, speed: 35 },
    { hour: '08:00', vehicles: 850, speed: 25 },
    { hour: '10:00', vehicles: 650, speed: 40 },
    { hour: '12:00', vehicles: 720, speed: 38 },
    { hour: '14:00', vehicles: 680, speed: 42 },
    { hour: '16:00', vehicles: 890, speed: 28 },
    { hour: '18:00', vehicles: 920, speed: 22 },
    { hour: '20:00', vehicles: 580, speed: 45 },
    { hour: '22:00', vehicles: 320, speed: 52 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Traffic Analytics</h2>
        <div className="flex gap-2">
          {['1h', '24h', '7d'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Speed</p>
                <p className="text-2xl font-bold">{currentStats.avgSpeed} mph</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +2.1% vs last period
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-2xl font-bold">{currentStats.totalVehicles.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <TrendingDown className="h-3 w-3" />
                  -5.2% vs last period
                </div>
              </div>
              <Car className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Incidents</p>
                <p className="text-2xl font-bold">{currentStats.incidents}</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingDown className="h-3 w-3" />
                  -1 vs last period
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{currentStats.efficiency}%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  +1.8% vs last period
                </div>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Traffic Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="bg-blue-500 rounded-t-sm w-full transition-all hover:bg-blue-400"
                    style={{ height: `${(data.vehicles / 1000) * 100}%` }}
                    title={`${data.hour}: ${data.vehicles} vehicles`}
                  ></div>
                  <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                    {data.hour}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Speed Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {hourlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="bg-green-500 rounded-t-sm w-full transition-all hover:bg-green-400"
                    style={{ height: `${(data.speed / 60) * 100}%` }}
                    title={`${data.hour}: ${data.speed} mph`}
                  ></div>
                  <span className="text-xs text-muted-foreground transform -rotate-45 origin-center">
                    {data.hour}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// TrafficControl Component
const TrafficControl = () => {
  const [lightControls, setLightControls] = useState([
    { id: 1, name: 'Main St & 1st Ave', mode: 'auto', status: 'green', timing: 45 },
    { id: 2, name: 'Oak St & 2nd Ave', mode: 'manual', status: 'red', timing: 120 },
    { id: 3, name: 'Pine St & 3rd Ave', mode: 'emergency', status: 'flashing', timing: 0 },
    { id: 4, name: 'Elm St & 4th Ave', mode: 'auto', status: 'yellow', timing: 10 },
    { id: 5, name: 'Cedar St & 5th Ave', mode: 'auto', status: 'green', timing: 30 }
  ])

  const [systemSettings, setSystemSettings] = useState({
    adaptiveControl: true,
    emergencyOverride: false,
    peakHourMode: true,
    maintenanceMode: false
  })

  const toggleLightMode = (id) => {
    setLightControls(prev => prev.map(light => 
      light.id === id 
        ? { ...light, mode: light.mode === 'auto' ? 'manual' : 'auto' }
        : light
    ))
  }

  const toggleSystemSetting = (setting) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'bg-green-500'
      case 'yellow': return 'bg-yellow-500'
      case 'red': return 'bg-red-500'
      case 'flashing': return 'bg-orange-500 animate-pulse'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Traffic Control Center</h2>
        <Badge variant={systemSettings.maintenanceMode ? 'destructive' : 'default'}>
          {systemSettings.maintenanceMode ? 'Maintenance Mode' : 'Operational'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Light Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lightControls.map((light) => (
                <div key={light.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(light.status)}`}></div>
                    <div>
                      <p className="font-medium">{light.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Mode: {light.mode}</span>
                        {light.timing > 0 && <span>• {light.timing}s remaining</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={light.mode === 'auto' ? 'default' : 'outline'}
                      onClick={() => toggleLightMode(light.id)}
                    >
                      {light.mode === 'auto' ? 'Auto' : 'Manual'}
                    </Button>
                    {light.mode === 'manual' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="px-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(systemSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {key === 'adaptiveControl' && 'Automatically adjust timing based on traffic'}
                      {key === 'emergencyOverride' && 'Priority routing for emergency vehicles'}
                      {key === 'peakHourMode' && 'Extended timing during rush hours'}
                      {key === 'maintenanceMode' && 'Disable automatic controls'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSystemSetting(key)}
                    className="ml-4"
                  >
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Override
              </Button>
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Optimize All Lights
              </Button>
              <Button className="w-full" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                Run System Diagnostic
              </Button>
              <Button className="w-full" variant="destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Emergency Stop
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Smart City Traffic Management</h1>
                <p className="text-sm text-muted-foreground">Real-time traffic monitoring and control system</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                System Online
              </Badge>
              <Badge variant="secondary">5 Active Sensors</Badge>
              <Badge variant="destructive">2 Incidents</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Traffic Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="control" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Control Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Sensors</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Speed</p>
                      <p className="text-2xl font-bold">42 mph</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Incidents</p>
                      <p className="text-2xl font-bold">2</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Traffic Lights</p>
                      <p className="text-2xl font-bold">5</p>
                    </div>
                    <Settings className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <TrafficMap />
          </TabsContent>

          <TabsContent value="analytics">
            <TrafficStats />
          </TabsContent>

          <TabsContent value="control">
            <TrafficControl />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>© 2024 Smart City Traffic Management System</p>
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App