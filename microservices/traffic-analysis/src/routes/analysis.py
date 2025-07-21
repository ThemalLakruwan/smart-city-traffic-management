from flask import Blueprint, request, jsonify
import requests
import statistics
from datetime import datetime, timedelta
import json

analysis_bp = Blueprint('analysis', __name__)

# Configuration for data ingestion service
DATA_INGESTION_URL = "http://localhost:5000/api"

@analysis_bp.route('/traffic-patterns', methods=['GET'])
def analyze_traffic_patterns():
    """Analyze traffic patterns from ingested data"""
    try:
        # Get traffic data from data ingestion service
        response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=100")
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch traffic data'}), 500
        
        traffic_data = response.json()['data']
        
        if not traffic_data:
            return jsonify({'message': 'No traffic data available for analysis'}), 200
        
        # Analyze patterns by sensor
        sensor_analysis = {}
        congestion_summary = {'LOW': 0, 'MEDIUM': 0, 'HIGH': 0}
        
        for data in traffic_data:
            sensor_id = data['sensor_id']
            
            if sensor_id not in sensor_analysis:
                sensor_analysis[sensor_id] = {
                    'vehicle_counts': [],
                    'speeds': [],
                    'congestion_levels': [],
                    'location': {
                        'lat': data['location_lat'],
                        'lng': data['location_lng']
                    }
                }
            
            sensor_analysis[sensor_id]['vehicle_counts'].append(data['vehicle_count'])
            sensor_analysis[sensor_id]['speeds'].append(data['average_speed'])
            sensor_analysis[sensor_id]['congestion_levels'].append(data['congestion_level'])
            
            # Count congestion levels
            congestion_summary[data['congestion_level']] += 1
        
        # Calculate statistics for each sensor
        analysis_results = {}
        for sensor_id, data in sensor_analysis.items():
            analysis_results[sensor_id] = {
                'location': data['location'],
                'avg_vehicle_count': round(statistics.mean(data['vehicle_counts']), 2),
                'max_vehicle_count': max(data['vehicle_counts']),
                'min_vehicle_count': min(data['vehicle_counts']),
                'avg_speed': round(statistics.mean(data['speeds']), 2),
                'max_speed': max(data['speeds']),
                'min_speed': min(data['speeds']),
                'most_common_congestion': max(set(data['congestion_levels']), 
                                            key=data['congestion_levels'].count),
                'data_points': len(data['vehicle_counts'])
            }
        
        return jsonify({
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'total_data_points': len(traffic_data),
            'congestion_summary': congestion_summary,
            'sensor_analysis': analysis_results,
            'overall_stats': {
                'avg_vehicle_count': round(statistics.mean([d['vehicle_count'] for d in traffic_data]), 2),
                'avg_speed': round(statistics.mean([d['average_speed'] for d in traffic_data]), 2)
            }
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to data ingestion service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/congestion-hotspots', methods=['GET'])
def identify_congestion_hotspots():
    """Identify areas with high congestion"""
    try:
        # Get traffic data
        response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=200")
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch traffic data'}), 500
        
        traffic_data = response.json()['data']
        
        if not traffic_data:
            return jsonify({'message': 'No traffic data available for analysis'}), 200
        
        # Group by location and calculate congestion scores
        location_congestion = {}
        
        for data in traffic_data:
            location_key = f"{data['location_lat']:.4f},{data['location_lng']:.4f}"
            
            if location_key not in location_congestion:
                location_congestion[location_key] = {
                    'location': {
                        'lat': data['location_lat'],
                        'lng': data['location_lng']
                    },
                    'sensor_id': data['sensor_id'],
                    'congestion_scores': [],
                    'vehicle_counts': [],
                    'speeds': []
                }
            
            # Calculate congestion score (higher vehicle count + lower speed = higher congestion)
            congestion_score = data['vehicle_count'] / max(data['average_speed'], 1)
            location_congestion[location_key]['congestion_scores'].append(congestion_score)
            location_congestion[location_key]['vehicle_counts'].append(data['vehicle_count'])
            location_congestion[location_key]['speeds'].append(data['average_speed'])
        
        # Calculate average congestion scores and identify hotspots
        hotspots = []
        for location_key, data in location_congestion.items():
            avg_congestion_score = statistics.mean(data['congestion_scores'])
            avg_vehicle_count = statistics.mean(data['vehicle_counts'])
            avg_speed = statistics.mean(data['speeds'])
            
            hotspot_data = {
                'location': data['location'],
                'sensor_id': data['sensor_id'],
                'avg_congestion_score': round(avg_congestion_score, 2),
                'avg_vehicle_count': round(avg_vehicle_count, 2),
                'avg_speed': round(avg_speed, 2),
                'data_points': len(data['congestion_scores'])
            }
            
            # Consider it a hotspot if congestion score is above threshold
            if avg_congestion_score > 2.0:  # Threshold can be adjusted
                hotspot_data['severity'] = 'HIGH' if avg_congestion_score > 4.0 else 'MEDIUM'
                hotspots.append(hotspot_data)
        
        # Sort hotspots by congestion score (highest first)
        hotspots.sort(key=lambda x: x['avg_congestion_score'], reverse=True)
        
        return jsonify({
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'total_locations_analyzed': len(location_congestion),
            'hotspots_identified': len(hotspots),
            'hotspots': hotspots[:10]  # Return top 10 hotspots
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to data ingestion service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/incident-impact', methods=['GET'])
def analyze_incident_impact():
    """Analyze the impact of incidents on traffic flow"""
    try:
        # Get incidents data
        incidents_response = requests.get(f"{DATA_INGESTION_URL}/incidents")
        traffic_response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=100")
        
        if incidents_response.status_code != 200 or traffic_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch data'}), 500
        
        incidents = incidents_response.json()['incidents']
        traffic_data = traffic_response.json()['data']
        
        if not incidents or not traffic_data:
            return jsonify({'message': 'Insufficient data for incident impact analysis'}), 200
        
        impact_analysis = []
        
        for incident in incidents:
            # Find nearby traffic data (within ~0.01 degrees, roughly 1km)
            nearby_traffic = []
            for traffic in traffic_data:
                lat_diff = abs(traffic['location_lat'] - incident['location_lat'])
                lng_diff = abs(traffic['location_lng'] - incident['location_lng'])
                
                if lat_diff <= 0.01 and lng_diff <= 0.01:
                    nearby_traffic.append(traffic)
            
            if nearby_traffic:
                avg_speed = statistics.mean([t['average_speed'] for t in nearby_traffic])
                avg_vehicle_count = statistics.mean([t['vehicle_count'] for t in nearby_traffic])
                
                # Estimate impact based on severity and nearby traffic conditions
                impact_score = 0
                if incident['severity'] == 'CRITICAL':
                    impact_score = 10
                elif incident['severity'] == 'HIGH':
                    impact_score = 7
                elif incident['severity'] == 'MEDIUM':
                    impact_score = 4
                else:
                    impact_score = 2
                
                # Adjust impact based on traffic conditions
                if avg_speed < 30:
                    impact_score += 2
                if avg_vehicle_count > 50:
                    impact_score += 2
                
                impact_analysis.append({
                    'incident_id': incident['id'],
                    'incident_type': incident['incident_type'],
                    'severity': incident['severity'],
                    'location': {
                        'lat': incident['location_lat'],
                        'lng': incident['location_lng']
                    },
                    'impact_score': min(impact_score, 10),  # Cap at 10
                    'nearby_avg_speed': round(avg_speed, 2),
                    'nearby_avg_vehicle_count': round(avg_vehicle_count, 2),
                    'affected_sensors': len(nearby_traffic)
                })
        
        # Sort by impact score
        impact_analysis.sort(key=lambda x: x['impact_score'], reverse=True)
        
        return jsonify({
            'analysis_timestamp': datetime.utcnow().isoformat(),
            'total_incidents_analyzed': len(incidents),
            'incidents_with_traffic_impact': len(impact_analysis),
            'impact_analysis': impact_analysis
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to data ingestion service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'traffic-analysis',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200