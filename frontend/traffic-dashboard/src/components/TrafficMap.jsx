import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, Navigation, RefreshCw } from 'lucide-react';

const TrafficMap = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [trafficLights, setTrafficLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockTrafficData = [
      { id: 1, sensor_id: 'SENSOR_001', location_lat: 40.7128, location_lng: -74.0060, vehicle_count: 45, average_speed: 35, congestion_level: 'MEDIUM' },
      { id: 2, sensor_id: 'SENSOR_002', location_lat: 40.7589, location_lng: -73.9851, vehicle_count: 78, average_speed: 22, congestion_level: 'HIGH' },
      { id: 3, sensor_id: 'SENSOR_003', location_lat: 40.7505, location_lng: -73.9934, vehicle_count: 32, average_speed: 55, congestion_level: 'LOW' },
      { id: 4, sensor_id: 'SENSOR_004', location_lat: 40.7282, location_lng: -73.7949, vehicle_count: 56, average_speed: 28, congestion_level: 'HIGH' },
      { id: 5, sensor_id: 'SENSOR_005', location_lat: 40.6892, location_lng: -74.0445, vehicle_count: 23, average_speed: 62, congestion_level: 'LOW' },
    ];

    const mockIncidents = [
      { id: 1, incident_type: 'ACCIDENT', location_lat: 40.7589, location_lng: -73.9851, severity: 'HIGH', description: 'Multi-vehicle accident blocking two lanes' },
      { id: 2, incident_type: 'CONSTRUCTION', location_lat: 40.7282, location_lng: -73.7949, severity: 'MEDIUM', description: 'Road construction reducing traffic to one lane' },
    ];

    const mockTrafficLights = [
      { id: 1, light_id: 'TL_001', location_lat: 40.7128, location_lng: -74.0060, current_state: 'GREEN', intersection_name: 'Times Square' },
      { id: 2, light_id: 'TL_002', location_lat: 40.7589, location_lng: -73.9851, current_state: 'RED', intersection_name: 'Central Park South' },
      { id: 3, light_id: 'TL_003', location_lat: 40.7505, location_lng: -73.9934, current_state: 'GREEN', intersection_name: 'Herald Square' },
    ];

    setTrafficData(mockTrafficData);
    setIncidents(mockIncidents);
    setTrafficLights(mockTrafficLights);
    setLoading(false);
  }, []);

  const getCongestionColor = (level) => {
    switch (level) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrafficLightColor = (state) => {
    switch (state) {
      case 'RED': return 'bg-red-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'GREEN': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'ACCIDENT': return '🚗';
      case 'CONSTRUCTION': return '🚧';
      case 'WEATHER': return '🌧️';
      default: return '⚠️';
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading traffic data...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Traffic Map Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Simplified map representation */}
          <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
            {/* Grid background to simulate map */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-8 grid-rows-6 h-full">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>

            {/* Traffic sensors */}
            {trafficData.map((sensor) => (
              <div
                key={sensor.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{
                  left: `${((sensor.location_lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - sensor.location_lat) / 0.2) * 100}%`,
                }}
                onClick={() => setSelectedLocation(sensor)}
              >
                <div className={`w-4 h-4 rounded-full ${getCongestionColor(sensor.congestion_level)} border-2 border-white shadow-lg`}>
                </div>
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                  {sensor.sensor_id}
                </div>
              </div>
            ))}

            {/* Traffic lights */}
            {trafficLights.map((light) => (
              <div
                key={light.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((light.location_lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - light.location_lat) / 0.2) * 100}%`,
                }}
              >
                <div className={`w-3 h-6 rounded-sm ${getTrafficLightColor(light.current_state)} border border-gray-600`}>
                </div>
              </div>
            ))}

            {/* Incidents */}
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${((incident.location_lng + 74.1) / 0.4) * 100}%`,
                  top: `${((40.8 - incident.location_lat) / 0.2) * 100}%`,
                }}
              >
                <div className="text-2xl animate-pulse">
                  {getIncidentIcon(incident.incident_type)}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Low Congestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Medium Congestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>High Congestion</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-6 rounded-sm bg-green-500 border border-gray-600"></div>
              <span>Traffic Light</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              <span>Incident</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected location details */}
      {selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sensor Details: {selectedLocation.sensor_id}</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedLocation(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Vehicle Count</p>
                <p className="text-2xl font-bold">{selectedLocation.vehicle_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Speed</p>
                <p className="text-2xl font-bold">{selectedLocation.average_speed} mph</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Congestion Level</p>
                <Badge variant={selectedLocation.congestion_level === 'HIGH' ? 'destructive' : selectedLocation.congestion_level === 'MEDIUM' ? 'default' : 'secondary'}>
                  {selectedLocation.congestion_level}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="text-sm">{selectedLocation.location_lat.toFixed(4)}, {selectedLocation.location_lng.toFixed(4)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrafficMap;