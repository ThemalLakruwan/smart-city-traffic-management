import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Car, Clock, AlertTriangle, Activity } from 'lucide-react';

const TrafficStats = () => {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    averageSpeed: 0,
    activeIncidents: 0,
    congestionAreas: 0
  });

  const [chartData, setChartData] = useState([]);
  const [congestionData, setCongestionData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    // Mock data for demonstration
    const mockStats = {
      totalVehicles: 234,
      averageSpeed: 42.5,
      activeIncidents: 3,
      congestionAreas: 2
    };

    const mockChartData = [
      { name: 'SENSOR_001', vehicles: 45, speed: 35 },
      { name: 'SENSOR_002', vehicles: 78, speed: 22 },
      { name: 'SENSOR_003', vehicles: 32, speed: 55 },
      { name: 'SENSOR_004', vehicles: 56, speed: 28 },
      { name: 'SENSOR_005', vehicles: 23, speed: 62 },
    ];

    const mockCongestionData = [
      { name: 'Low', value: 3, color: '#10b981' },
      { name: 'Medium', value: 1, color: '#f59e0b' },
      { name: 'High', value: 2, color: '#ef4444' },
    ];

    const mockHourlyData = [
      { hour: '00:00', vehicles: 15, speed: 65 },
      { hour: '06:00', vehicles: 45, speed: 45 },
      { hour: '08:00', vehicles: 85, speed: 25 },
      { hour: '12:00', vehicles: 65, speed: 35 },
      { hour: '17:00', vehicles: 95, speed: 20 },
      { hour: '20:00', vehicles: 55, speed: 40 },
      { hour: '23:00', vehicles: 25, speed: 60 },
    ];

    setStats(mockStats);
    setChartData(mockChartData);
    setCongestionData(mockCongestionData);
    setHourlyData(mockHourlyData);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, unit = '' }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}{unit}</p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {trendValue}% from last hour
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={Car}
          trend="up"
          trendValue={12}
        />
        <StatCard
          title="Average Speed"
          value={stats.averageSpeed}
          unit=" mph"
          icon={Activity}
          trend="down"
          trendValue={5}
        />
        <StatCard
          title="Active Incidents"
          value={stats.activeIncidents}
          icon={AlertTriangle}
        />
        <StatCard
          title="Congestion Areas"
          value={stats.congestionAreas}
          icon={Clock}
          trend="down"
          trendValue={25}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Count by Sensor */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Count by Sensor</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vehicles" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Congestion Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Congestion Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={congestionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {congestionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Traffic Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Traffic Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="vehicles" fill="#3b82f6" name="Vehicle Count" />
              <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={2} name="Average Speed (mph)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">High congestion detected</p>
                  <p className="text-sm text-muted-foreground">SENSOR_002 - Central Park South</p>
                </div>
              </div>
              <Badge variant="destructive">HIGH</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="font-medium">Traffic light timing adjusted</p>
                  <p className="text-sm text-muted-foreground">TL_001 - Times Square</p>
                </div>
              </div>
              <Badge variant="default">MEDIUM</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Traffic flow improved</p>
                  <p className="text-sm text-muted-foreground">SENSOR_005 - Brooklyn Bridge</p>
                </div>
              </div>
              <Badge variant="secondary">LOW</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrafficStats;