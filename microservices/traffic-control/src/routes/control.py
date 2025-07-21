from flask import Blueprint, request, jsonify
from src.models.traffic_control import db, TrafficLight, TrafficSignal, ControlAction
import requests
import json
from datetime import datetime, timedelta

control_bp = Blueprint('control', __name__)

# Configuration for other services
DATA_INGESTION_URL = "http://localhost:5000/api"
TRAFFIC_ANALYSIS_URL = "http://localhost:5001/api"
TRAFFIC_PREDICTION_URL = "http://localhost:5002/api"

@control_bp.route('/traffic-lights', methods=['GET'])
def get_traffic_lights():
    """Get all traffic lights"""
    try:
        lights = TrafficLight.query.filter_by(is_active=True).all()
        return jsonify({
            'traffic_lights': [light.to_dict() for light in lights],
            'count': len(lights)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@control_bp.route('/traffic-lights', methods=['POST'])
def create_traffic_light():
    """Create a new traffic light"""
    try:
        data = request.get_json()
        
        required_fields = ['light_id', 'location_lat', 'location_lng']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if light_id already exists
        existing_light = TrafficLight.query.filter_by(light_id=data['light_id']).first()
        if existing_light:
            return jsonify({'error': 'Traffic light with this ID already exists'}), 400
        
        traffic_light = TrafficLight(
            light_id=data['light_id'],
            location_lat=data['location_lat'],
            location_lng=data['location_lng'],
            intersection_name=data.get('intersection_name', ''),
            cycle_duration=data.get('cycle_duration', 120)
        )
        
        db.session.add(traffic_light)
        db.session.commit()
        
        return jsonify({
            'message': 'Traffic light created successfully',
            'traffic_light': traffic_light.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/traffic-lights/<light_id>/state', methods=['PUT'])
def update_traffic_light_state():
    """Update traffic light state"""
    try:
        data = request.get_json()
        
        if 'state' not in data:
            return jsonify({'error': 'Missing required field: state'}), 400
        
        if data['state'] not in ['RED', 'YELLOW', 'GREEN']:
            return jsonify({'error': 'Invalid state. Must be RED, YELLOW, or GREEN'}), 400
        
        traffic_light = TrafficLight.query.filter_by(light_id=light_id).first()
        if not traffic_light:
            return jsonify({'error': 'Traffic light not found'}), 404
        
        old_state = traffic_light.current_state
        traffic_light.current_state = data['state']
        traffic_light.last_updated = datetime.utcnow()
        
        # Log the control action
        action = ControlAction(
            action_type='LIGHT_CHANGE',
            target_id=light_id,
            action_data=json.dumps({
                'old_state': old_state,
                'new_state': data['state'],
                'reason': data.get('reason', 'Manual update')
            }),
            status='EXECUTED',
            executed_at=datetime.utcnow(),
            created_by=data.get('operator', 'SYSTEM')
        )
        
        db.session.add(action)
        db.session.commit()
        
        return jsonify({
            'message': 'Traffic light state updated successfully',
            'traffic_light': traffic_light.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/adaptive-control', methods=['POST'])
def adaptive_traffic_control():
    """Implement adaptive traffic control based on current conditions"""
    try:
        # Get current traffic data
        traffic_response = requests.get(f"{DATA_INGESTION_URL}/traffic-data?limit=50")
        if traffic_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch traffic data'}), 500
        
        traffic_data = traffic_response.json()['data']
        
        # Get traffic lights
        traffic_lights = TrafficLight.query.filter_by(is_active=True).all()
        
        control_actions = []
        
        for light in traffic_lights:
            # Find nearby traffic data
            nearby_traffic = []
            for traffic in traffic_data:
                lat_diff = abs(traffic['location_lat'] - light.location_lat)
                lng_diff = abs(traffic['location_lng'] - light.location_lng)
                
                if lat_diff <= 0.005 and lng_diff <= 0.005:  # Very close to intersection
                    nearby_traffic.append(traffic)
            
            if nearby_traffic:
                # Calculate average congestion
                avg_vehicle_count = sum(t['vehicle_count'] for t in nearby_traffic) / len(nearby_traffic)
                high_congestion_count = sum(1 for t in nearby_traffic if t['congestion_level'] == 'HIGH')
                
                # Determine optimal light timing
                new_cycle_duration = light.cycle_duration
                recommended_state = light.current_state
                
                if high_congestion_count > len(nearby_traffic) * 0.5:
                    # High congestion - extend green time
                    new_cycle_duration = min(180, light.cycle_duration + 30)
                    if light.current_state == 'RED':
                        recommended_state = 'GREEN'
                elif avg_vehicle_count < 20:
                    # Low traffic - reduce cycle time
                    new_cycle_duration = max(60, light.cycle_duration - 20)
                
                # Update if changes are needed
                if new_cycle_duration != light.cycle_duration:
                    light.cycle_duration = new_cycle_duration
                    
                    action = ControlAction(
                        action_type='LIGHT_TIMING_UPDATE',
                        target_id=light.light_id,
                        action_data=json.dumps({
                            'old_cycle_duration': light.cycle_duration,
                            'new_cycle_duration': new_cycle_duration,
                            'avg_vehicle_count': round(avg_vehicle_count, 1),
                            'high_congestion_areas': high_congestion_count
                        }),
                        status='EXECUTED',
                        executed_at=datetime.utcnow(),
                        created_by='ADAPTIVE_SYSTEM'
                    )
                    
                    db.session.add(action)
                    control_actions.append(action.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'message': 'Adaptive traffic control executed',
            'timestamp': datetime.utcnow().isoformat(),
            'actions_taken': len(control_actions),
            'control_actions': control_actions
        }), 200
        
    except requests.RequestException as e:
        return jsonify({'error': f'Failed to connect to traffic data service: {str(e)}'}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/emergency-response', methods=['POST'])
def emergency_response():
    """Handle emergency response traffic control"""
    try:
        data = request.get_json()
        
        required_fields = ['emergency_type', 'location_lat', 'location_lng']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        emergency_lat = data['location_lat']
        emergency_lng = data['location_lng']
        emergency_type = data['emergency_type']
        
        # Find nearby traffic lights (within 0.01 degrees, roughly 1km)
        nearby_lights = TrafficLight.query.filter(
            TrafficLight.is_active == True
        ).all()
        
        affected_lights = []
        for light in nearby_lights:
            lat_diff = abs(light.location_lat - emergency_lat)
            lng_diff = abs(light.location_lng - emergency_lng)
            
            if lat_diff <= 0.01 and lng_diff <= 0.01:
                affected_lights.append(light)
        
        control_actions = []
        
        # Create emergency signals
        emergency_signal = TrafficSignal(
            signal_id=f"EMERGENCY_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            signal_type='EMERGENCY_RESPONSE',
            location_lat=emergency_lat,
            location_lng=emergency_lng,
            message=f"Emergency Response: {emergency_type}. Clear the area.",
            priority='CRITICAL',
            expires_at=datetime.utcnow() + timedelta(hours=2)
        )
        
        db.session.add(emergency_signal)
        
        # Update traffic lights for emergency corridor
        for light in affected_lights:
            # Set lights to facilitate emergency vehicle passage
            old_state = light.current_state
            light.current_state = 'GREEN'  # Assume green for emergency route
            light.last_updated = datetime.utcnow()
            
            action = ControlAction(
                action_type='EMERGENCY_OVERRIDE',
                target_id=light.light_id,
                action_data=json.dumps({
                    'emergency_type': emergency_type,
                    'old_state': old_state,
                    'new_state': 'GREEN',
                    'emergency_location': {'lat': emergency_lat, 'lng': emergency_lng}
                }),
                status='EXECUTED',
                executed_at=datetime.utcnow(),
                created_by='EMERGENCY_SYSTEM'
            )
            
            db.session.add(action)
            control_actions.append(action.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'message': 'Emergency response activated',
            'emergency_signal': emergency_signal.to_dict(),
            'affected_lights': len(affected_lights),
            'control_actions': control_actions
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/signals', methods=['GET'])
def get_traffic_signals():
    """Get active traffic signals"""
    try:
        signals = TrafficSignal.query.filter_by(is_active=True).all()
        return jsonify({
            'signals': [signal.to_dict() for signal in signals],
            'count': len(signals)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@control_bp.route('/signals', methods=['POST'])
def create_traffic_signal():
    """Create a new traffic signal"""
    try:
        data = request.get_json()
        
        required_fields = ['signal_id', 'signal_type', 'location_lat', 'location_lng', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        signal = TrafficSignal(
            signal_id=data['signal_id'],
            signal_type=data['signal_type'],
            location_lat=data['location_lat'],
            location_lng=data['location_lng'],
            message=data['message'],
            priority=data.get('priority', 'MEDIUM'),
            expires_at=datetime.fromisoformat(data['expires_at']) if data.get('expires_at') else None
        )
        
        db.session.add(signal)
        db.session.commit()
        
        return jsonify({
            'message': 'Traffic signal created successfully',
            'signal': signal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/actions', methods=['GET'])
def get_control_actions():
    """Get recent control actions"""
    try:
        limit = request.args.get('limit', 50, type=int)
        actions = ControlAction.query.order_by(ControlAction.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'actions': [action.to_dict() for action in actions],
            'count': len(actions)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@control_bp.route('/initialize-demo-data', methods=['POST'])
def initialize_demo_data():
    """Initialize demo traffic lights and signals"""
    try:
        # Create demo traffic lights
        demo_lights = [
            {'light_id': 'TL_001', 'lat': 40.7128, 'lng': -74.0060, 'name': 'Times Square'},
            {'light_id': 'TL_002', 'lat': 40.7589, 'lng': -73.9851, 'name': 'Central Park South'},
            {'light_id': 'TL_003', 'lat': 40.7505, 'lng': -73.9934, 'name': 'Herald Square'},
            {'light_id': 'TL_004', 'lat': 40.7282, 'lng': -73.7949, 'name': 'Queens Plaza'},
            {'light_id': 'TL_005', 'lat': 40.6892, 'lng': -74.0445, 'name': 'Brooklyn Bridge'},
        ]
        
        created_lights = []
        for light_data in demo_lights:
            existing = TrafficLight.query.filter_by(light_id=light_data['light_id']).first()
            if not existing:
                light = TrafficLight(
                    light_id=light_data['light_id'],
                    location_lat=light_data['lat'],
                    location_lng=light_data['lng'],
                    intersection_name=light_data['name'],
                    current_state='GREEN',
                    cycle_duration=120
                )
                db.session.add(light)
                created_lights.append(light.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'message': 'Demo data initialized successfully',
            'created_lights': len(created_lights),
            'traffic_lights': created_lights
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@control_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'service': 'traffic-control',
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200
