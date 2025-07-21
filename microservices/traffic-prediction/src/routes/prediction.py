from flask import Blueprint, request, jsonify
import requests
import statistics
from datetime import datetime, timedelta
import random
import math

prediction_bp = Blueprint('prediction', __name__)

# Configuration for other services
DATA_INGESTION_URL = "http://localhost:5000/api"
TRAFFIC_ANALYSIS_URL = "http://localhost:5001/api"

@prediction_bp.route('/predict-congestion', methods=['POST'])
def predict_congestion():
    """Predict traffic congestion for a specific location and time"""
    try:
        data = request.get_json()
        
        # Required parameters
        required_fields = ['location_lat', 'location_lng', 'prediction_hours']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        location_lat = data['location_lat']
        location_lng = data['location_lng']
        prediction_hours = data['prediction_hours']
        
        # Get historical traffic data for the area
        response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=200")
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch historical traffic data'}), 500
        
        traffic_data = response.json()['data']
        
        # Filter data for nearby locations (within ~0.01 degrees)
        nearby_data = []
        for traffic in traffic_data:
            lat_diff = abs(traffic['location_lat'] - location_lat)
            lng_diff = abs(traffic['location_lng'] - location_lng)
            
            if lat_diff <= 0.01 and lng_diff <= 0.01:
                nearby_data.append(traffic)
        
        if not nearby_data:
            # If no nearby data, use general patterns
            nearby_data = traffic_data[:50]  # Use recent general data
        
        # Simple prediction model based on historical patterns
        predictions = []
        current_time = datetime.utcnow()
        
        for hour in range(1, prediction_hours + 1):
            prediction_time = current_time + timedelta(hours=hour)
            hour_of_day = prediction_time.hour
            day_of_week = prediction_time.weekday()  # 0=Monday, 6=Sunday
            
            # Calculate base prediction from historical data
            if nearby_data:
                base_vehicle_count = statistics.mean([d['vehicle_count'] for d in nearby_data])
                base_speed = statistics.mean([d['average_speed'] for d in nearby_data])
            else:
                base_vehicle_count = 40
                base_speed = 50
            
            # Apply time-based adjustments
            # Rush hour patterns (7-9 AM, 5-7 PM)
            rush_hour_multiplier = 1.0
            if (7 <= hour_of_day <= 9) or (17 <= hour_of_day <= 19):
                rush_hour_multiplier = 1.5
            elif (22 <= hour_of_day or hour_of_day <= 6):
                rush_hour_multiplier = 0.6
            
            # Weekend patterns
            weekend_multiplier = 1.0
            if day_of_week >= 5:  # Weekend
                weekend_multiplier = 0.8
                if 10 <= hour_of_day <= 16:  # Weekend afternoon
                    weekend_multiplier = 1.2
            
            # Calculate predicted values
            predicted_vehicle_count = int(base_vehicle_count * rush_hour_multiplier * weekend_multiplier)
            predicted_speed = base_speed / (rush_hour_multiplier * 0.8 + 0.2)
            
            # Add some randomness to make it more realistic
            predicted_vehicle_count += random.randint(-10, 10)
            predicted_speed += random.uniform(-5, 5)
            
            # Ensure reasonable bounds
            predicted_vehicle_count = max(5, min(predicted_vehicle_count, 150))
            predicted_speed = max(10, min(predicted_speed, 80))
            
            # Determine congestion level
            congestion_level = 'LOW'
            if predicted_vehicle_count > 50 and predicted_speed < 30:
                congestion_level = 'HIGH'
            elif predicted_vehicle_count > 30 or predicted_speed < 50:
                congestion_level = 'MEDIUM'
            
            # Calculate confidence based on amount of historical data
            confidence = min(0.95, 0.5 + (len(nearby_data) / 100))
            
            predictions.append({
                'prediction_time': prediction_time.isoformat(),
                'hour_offset': hour,
                'predicted_vehicle_count': round(predicted_vehicle_count),
                'predicted_speed': round(predicted_speed, 1),
                'predicted_congestion_level': congestion_level,
                'confidence': round(confidence, 2),
                'factors': {
                    'hour_of_day': hour_of_day,
                    'day_of_week': day_of_week,
                    'is_rush_hour': rush_hour_multiplier > 1.0,
                    'is_weekend': day_of_week >= 5
                }
            })
        
        return jsonify({
            'prediction_timestamp': current_time.isoformat(),
            'location': {
                'lat': location_lat,
                'lng': location_lng
            },
            'historical_data_points': len(nearby_data),
            'predictions': predictions
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to data service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/predict-route-time', methods=['POST'])
def predict_route_time():
    """Predict travel time for a route"""
    try:
        data = request.get_json()
        
        required_fields = ['start_lat', 'start_lng', 'end_lat', 'end_lng']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        start_lat = data['start_lat']
        start_lng = data['start_lng']
        end_lat = data['end_lat']
        end_lng = data['end_lng']
        
        # Calculate approximate distance (simplified)
        lat_diff = abs(end_lat - start_lat)
        lng_diff = abs(end_lng - start_lng)
        distance_km = math.sqrt(lat_diff**2 + lng_diff**2) * 111  # Rough conversion to km
        
        # Get current traffic conditions along the route
        response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=100")
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch traffic data'}), 500
        
        traffic_data = response.json()['data']
        
        # Find traffic data along the route (simplified - check points near the route)
        route_traffic = []
        for traffic in traffic_data:
            # Check if traffic point is roughly along the route
            if (min(start_lat, end_lat) - 0.01 <= traffic['location_lat'] <= max(start_lat, end_lat) + 0.01 and
                min(start_lng, end_lng) - 0.01 <= traffic['location_lng'] <= max(start_lng, end_lng) + 0.01):
                route_traffic.append(traffic)
        
        # Calculate average speed along route
        if route_traffic:
            avg_speed = statistics.mean([t['average_speed'] for t in route_traffic])
            congestion_levels = [t['congestion_level'] for t in route_traffic]
            high_congestion_count = congestion_levels.count('HIGH')
            medium_congestion_count = congestion_levels.count('MEDIUM')
        else:
            avg_speed = 50  # Default speed
            high_congestion_count = 0
            medium_congestion_count = 0
        
        # Adjust speed based on congestion
        if high_congestion_count > len(route_traffic) * 0.3:
            avg_speed *= 0.6  # Reduce speed significantly
        elif medium_congestion_count > len(route_traffic) * 0.5:
            avg_speed *= 0.8  # Reduce speed moderately
        
        # Calculate travel time
        travel_time_hours = distance_km / avg_speed
        travel_time_minutes = travel_time_hours * 60
        
        # Add buffer time based on congestion
        buffer_minutes = 0
        if high_congestion_count > 0:
            buffer_minutes = 15
        elif medium_congestion_count > 0:
            buffer_minutes = 5
        
        total_time_minutes = travel_time_minutes + buffer_minutes
        
        # Determine route status
        route_status = 'CLEAR'
        if high_congestion_count > len(route_traffic) * 0.2:
            route_status = 'HEAVY_TRAFFIC'
        elif medium_congestion_count > len(route_traffic) * 0.3:
            route_status = 'MODERATE_TRAFFIC'
        
        return jsonify({
            'prediction_timestamp': datetime.utcnow().isoformat(),
            'route': {
                'start': {'lat': start_lat, 'lng': start_lng},
                'end': {'lat': end_lat, 'lng': end_lng},
                'distance_km': round(distance_km, 2)
            },
            'traffic_analysis': {
                'data_points_analyzed': len(route_traffic),
                'average_speed_kmh': round(avg_speed, 1),
                'high_congestion_segments': high_congestion_count,
                'medium_congestion_segments': medium_congestion_count
            },
            'time_prediction': {
                'estimated_travel_time_minutes': round(travel_time_minutes, 1),
                'buffer_time_minutes': buffer_minutes,
                'total_time_minutes': round(total_time_minutes, 1),
                'route_status': route_status
            }
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to data service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/predict-optimal-routes', methods=['POST'])
def predict_optimal_routes():
    """Suggest optimal routes based on predicted traffic"""
    try:
        data = request.get_json()
        
        required_fields = ['start_lat', 'start_lng', 'end_lat', 'end_lng']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        start_lat = data['start_lat']
        start_lng = data['start_lng']
        end_lat = data['end_lat']
        end_lng = data['end_lng']
        
        # Get traffic analysis data
        analysis_response = requests.get(f"{TRAFFIC_ANALYSIS_URL}/congestion-hotspots")
        
        if analysis_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch traffic analysis data'}), 500
        
        hotspots = analysis_response.json().get('hotspots', [])
        
        # Generate multiple route options (simplified)
        routes = []
        
        # Route 1: Direct route
        direct_distance = math.sqrt((end_lat - start_lat)**2 + (end_lng - start_lng)**2) * 111
        direct_hotspots = 0
        
        for hotspot in hotspots:
            # Check if hotspot is near the direct route
            if (min(start_lat, end_lat) - 0.01 <= hotspot['location']['lat'] <= max(start_lat, end_lat) + 0.01 and
                min(start_lng, end_lng) - 0.01 <= hotspot['location']['lng'] <= max(start_lng, end_lng) + 0.01):
                direct_hotspots += 1
        
        direct_speed = 50 - (direct_hotspots * 10)  # Reduce speed for each hotspot
        direct_time = (direct_distance / max(direct_speed, 20)) * 60
        
        routes.append({
            'route_id': 'direct',
            'route_name': 'Direct Route',
            'distance_km': round(direct_distance, 2),
            'estimated_time_minutes': round(direct_time, 1),
            'hotspots_encountered': direct_hotspots,
            'route_score': round(100 - (direct_hotspots * 20) - (direct_time * 0.5), 1),
            'waypoints': [
                {'lat': start_lat, 'lng': start_lng},
                {'lat': end_lat, 'lng': end_lng}
            ]
        })
        
        # Route 2: Alternative route (slightly longer but potentially faster)
        alt_lat_offset = 0.01 if (end_lat - start_lat) > 0 else -0.01
        alt_lng_offset = 0.01 if (end_lng - start_lng) > 0 else -0.01
        
        alt_distance = direct_distance * 1.2  # 20% longer
        alt_hotspots = max(0, direct_hotspots - 1)  # Assume fewer hotspots
        alt_speed = 55 - (alt_hotspots * 8)
        alt_time = (alt_distance / max(alt_speed, 25)) * 60
        
        routes.append({
            'route_id': 'alternative',
            'route_name': 'Alternative Route',
            'distance_km': round(alt_distance, 2),
            'estimated_time_minutes': round(alt_time, 1),
            'hotspots_encountered': alt_hotspots,
            'route_score': round(100 - (alt_hotspots * 20) - (alt_time * 0.5), 1),
            'waypoints': [
                {'lat': start_lat, 'lng': start_lng},
                {'lat': start_lat + alt_lat_offset, 'lng': start_lng + alt_lng_offset},
                {'lat': end_lat, 'lng': end_lng}
            ]
        })
        
        # Route 3: Scenic route (longer but least congested)
        scenic_distance = direct_distance * 1.4
        scenic_hotspots = 0
        scenic_speed = 60
        scenic_time = (scenic_distance / scenic_speed) * 60
        
        routes.append({
            'route_id': 'scenic',
            'route_name': 'Scenic Route (Least Congested)',
            'distance_km': round(scenic_distance, 2),
            'estimated_time_minutes': round(scenic_time, 1),
            'hotspots_encountered': scenic_hotspots,
            'route_score': round(100 - (scenic_time * 0.3), 1),
            'waypoints': [
                {'lat': start_lat, 'lng': start_lng},
                {'lat': start_lat - alt_lat_offset, 'lng': start_lng - alt_lng_offset},
                {'lat': end_lat - alt_lat_offset, 'lng': end_lng - alt_lng_offset},
                {'lat': end_lat, 'lng': end_lng}
            ]
        })
        
        # Sort routes by score (best first)
        routes.sort(key=lambda x: x['route_score'], reverse=True)
        
        return jsonify({
            'prediction_timestamp': datetime.utcnow().isoformat(),
            'origin': {'lat': start_lat, 'lng': start_lng},
            'destination': {'lat': end_lat, 'lng': end_lng},
            'total_hotspots_in_area': len(hotspots),
            'recommended_routes': routes
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to analysis service: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@prediction_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'traffic-prediction',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200