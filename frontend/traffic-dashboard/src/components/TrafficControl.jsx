import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Play, Pause, Settings, Zap, Navigation, Shield } from 'lucide-react';

const TrafficControl = () => {
  const [trafficLights, setTrafficLights] = useState([]);
  const [signals, setSignals] = useState([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [adaptiveControl, setAdaptiveControl] = useState(true);
  const [selectedLight, setSelectedLight] = useState(null);
  const [newSignal, setNewSignal] = useState({
    type: '',
    message: '',
    priority: 'MEDIUM',
    location: ''
  });

  useEffect(() => {
    // Mock data for demonstration
    const mockTrafficLights = [
      { id: 1, light_id: 'TL_001', intersection_name: 'Times Square', current_state: 'GREEN', cycle_duration: 120, is_active: true },
      { id: 2, light_id: 'TL_002', intersection_name: 'Central Park South', current_state: 'RED', cycle_duration: 90, is_active: true },
      { id: 3, light_id: 'TL_003', intersection_name: 'Herald Square', current_state: 'GREEN', cycle_duration: 110, is_active: true },
      { id: 4, light_id: 'TL_004', intersection_name: 'Queens Plaza', current_state: 'YELLOW', cycle_duration: 100, is_active: false },
      { id: 5, light_id: 'TL_005', intersection_name: 'Brooklyn Bridge', current_state: 'GREEN', cycle_duration: 130, is_active: true },
    ];

    const mockSignals = [
      { id: 1, signal_type: 'SPEED_LIMIT', message: 'Speed limit reduced to 25 mph due to construction', priority: 'HIGH', is_active: true },
      { id: 2, signal_type: 'LANE_CLOSURE', message: 'Right lane closed ahead - merge left', priority: 'MEDIUM', is_active: true },
      { id: 3, signal_type: 'REROUTE', message: 'Alternative route recommended via Broadway', priority: 'LOW', is_active: true },
    ];

    setTrafficLights(mockTrafficLights);
    setSignals(mockSignals);
  }, []);

  const getStateColor = (state) => {
    switch (state) {
      case 'RED': return 'bg-red-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'GREEN': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const handleLightStateChange = (lightId, newState) => {
    setTrafficLights(lights =>
      lights.map(light =>
        light.light_id === lightId
          ? { ...light, current_state: newState }
          : light
      )
    );
  };

  const handleEmergencyResponse = () => {
    // Simulate emergency response
    setEmergencyMode(true);
    setTrafficLights(lights =>
      lights.map(light => ({ ...light, current_state: 'GREEN' }))
    );
    
    setTimeout(() => {
      setEmergencyMode(false);
    }, 10000); // Reset after 10 seconds
  };

  const handleAdaptiveControl = () => {
    if (adaptiveControl) {
      // Simulate adaptive control adjustments
      setTrafficLights(lights =>
        lights.map(light => ({
          ...light,
          cycle_duration: Math.max(60, Math.min(180, light.cycle_duration + (Math.random() - 0.5) * 40))
        }))
      );
    }
  };

  const handleCreateSignal = () => {
    if (newSignal.type && newSignal.message) {
      const signal = {
        id: signals.length + 1,
        signal_type: newSignal.type,
        message: newSignal.message,
        priority: newSignal.priority,
        is_active: true
      };
      setSignals([...signals, signal]);
      setNewSignal({ type: '', message: '', priority: 'MEDIUM', location: '' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Traffic Control Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Switch
                id="adaptive-control"
                checked={adaptiveControl}
                onCheckedChange={setAdaptiveControl}
              />
              <Label htmlFor="adaptive-control">Adaptive Control</Label>
            </div>
            
            <Button
              onClick={handleAdaptiveControl}
              disabled={!adaptiveControl}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Run Optimization
            </Button>
            
            <Button
              onClick={handleEmergencyResponse}
              variant="destructive"
              className="flex items-center gap-2"
              disabled={emergencyMode}
            >
              <Shield className="h-4 w-4" />
              {emergencyMode ? 'Emergency Active' : 'Emergency Response'}
            </Button>
            
            {emergencyMode && (
              <Badge variant="destructive" className="animate-pulse">
                EMERGENCY MODE ACTIVE
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Lights Control */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Light Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trafficLights.map((light) => (
              <Card key={light.id} className={`${!light.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{light.light_id}</h4>
                      <p className="text-sm text-muted-foreground">{light.intersection_name}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full ${getStateColor(light.current_state)}`}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cycle Duration:</span>
                      <span>{light.cycle_duration}s</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {['RED', 'YELLOW', 'GREEN'].map((state) => (
                        <Button
                          key={state}
                          size="sm"
                          variant={light.current_state === state ? 'default' : 'outline'}
                          onClick={() => handleLightStateChange(light.light_id, state)}
                          disabled={!light.is_active || emergencyMode}
                          className="flex-1"
                        >
                          {state}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active:</span>
                      <Switch
                        checked={light.is_active}
                        onCheckedChange={(checked) => {
                          setTrafficLights(lights =>
                            lights.map(l =>
                              l.id === light.id ? { ...l, is_active: checked } : l
                            )
                          );
                        }}
                        disabled={emergencyMode}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traffic Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Traffic Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {signals.map((signal) => (
                <div key={signal.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{signal.signal_type}</Badge>
                      <Badge variant={getPriorityVariant(signal.priority)}>{signal.priority}</Badge>
                    </div>
                    <p className="text-sm">{signal.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSignals(signals.filter(s => s.id !== signal.id));
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create New Signal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="signal-type">Signal Type</Label>
                <Select value={newSignal.type} onValueChange={(value) => setNewSignal({...newSignal, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select signal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPEED_LIMIT">Speed Limit</SelectItem>
                    <SelectItem value="LANE_CLOSURE">Lane Closure</SelectItem>
                    <SelectItem value="REROUTE">Reroute</SelectItem>
                    <SelectItem value="CONSTRUCTION">Construction</SelectItem>
                    <SelectItem value="WEATHER">Weather Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newSignal.priority} onValueChange={(value) => setNewSignal({...newSignal, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter signal message..."
                  value={newSignal.message}
                  onChange={(e) => setNewSignal({...newSignal, message: e.target.value})}
                />
              </div>

              <Button onClick={handleCreateSignal} className="w-full">
                Create Signal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrafficControl;