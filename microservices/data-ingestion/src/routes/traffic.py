from flask import Blueprint, request, jsonify
from src.models.traffic_data import db, TrafficData, TrafficIncident
from datetime import datetime
import random

traffic_bp = Blueprint('traffic', __name__)

@traffic_bp.route('/traffic-data', methods=['POST'])
def ingest_traffic_data():
    """Ingest traffic data from sensors"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['sensor_id', 'location_lat', 'location_lng', 'vehicle_count', 'average_speed']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Determine congestion level based on vehicle count and speed
        congestion_level = 'LOW'
        if data['vehicle_count'] > 50 and data['average_speed'] < 30:
            congestion_level = 'HIGH'
        elif data['vehicle_count'] > 30 or data['average_speed'] < 50:
            congestion_level = 'MEDIUM'
        
        traffic_data = TrafficData(
            sensor_id=data['sensor_id'],
            location_lat=data['location_lat'],
            location_lng=data['location_lng'],
            vehicle_count=data['vehicle_count'],
            average_speed=data['average_speed'],
            congestion_level=congestion_level
        )
        
        db.session.add(traffic_data)
        db.session.commit()
        
        return jsonify({
            'message': 'Traffic data ingested successfully',
            'data': traffic_data.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/traffic-data', methods=['GET'])
def get_traffic_data():
    """Get traffic data with optional filtering"""
    try:
        # Query parameters
        sensor_id = request.args.get('sensor_id')
        limit = request.args.get('limit', 100, type=int)
        
        query = TrafficData.query
        
        if sensor_id:
            query = query.filter(TrafficData.sensor_id == sensor_id)
        
        traffic_data = query.order_by(TrafficData.timestamp.desc()).limit(limit).all()
        
        return jsonify({
            'data': [data.to_dict() for data in traffic_data],
            'count': len(traffic_data)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/incidents', methods=['POST'])
def report_incident():
    """Report a traffic incident"""
    try:
        data = request.get_json()
        
        required_fields = ['incident_type', 'location_lat', 'location_lng', 'severity']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        incident = TrafficIncident(
            incident_type=data['incident_type'],
            location_lat=data['location_lat'],
            location_lng=data['location_lng'],
            severity=data['severity'],
            description=data.get('description', '')
        )
        
        db.session.add(incident)
        db.session.commit()
        
        return jsonify({
            'message': 'Incident reported successfully',
            'incident': incident.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/incidents', methods=['GET'])
def get_incidents():
    """Get traffic incidents"""
    try:
        status = request.args.get('status', 'ACTIVE')
        limit = request.args.get('limit', 50, type=int)
        
        incidents = TrafficIncident.query.filter(
            TrafficIncident.status == status
        ).order_by(TrafficIncident.reported_at.desc()).limit(limit).all()
        
        return jsonify({
            'incidents': [incident.to_dict() for incident in incidents],
            'count': len(incidents)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/simulate-data', methods=['POST'])
def simulate_traffic_data():
    """Simulate traffic data for testing purposes"""
    try:
        count = request.args.get('count', 10, type=int)
        
        # Predefined sensor locations in a city
        sensor_locations = [
            {'sensor_id': 'SENSOR_001', 'lat': 40.7128, 'lng': -74.0060},  # NYC
            {'sensor_id': 'SENSOR_002', 'lat': 40.7589, 'lng': -73.9851},
            {'sensor_id': 'SENSOR_003', 'lat': 40.7505, 'lng': -73.9934},
            {'sensor_id': 'SENSOR_004', 'lat': 40.7282, 'lng': -73.7949},
            {'sensor_id': 'SENSOR_005', 'lat': 40.6892, 'lng': -74.0445},
        ]
        
        created_data = []
        
        for _ in range(count):
            location = random.choice(sensor_locations)
            vehicle_count = random.randint(10, 100)
            average_speed = random.uniform(20, 80)
            
            # Determine congestion level
            congestion_level = 'LOW'
            if vehicle_count > 50 and average_speed < 30:
                congestion_level = 'HIGH'
            elif vehicle_count > 30 or average_speed < 50:
                congestion_level = 'MEDIUM'
            
            traffic_data = TrafficData(
                sensor_id=location['sensor_id'],
                location_lat=location['lat'],
                location_lng=location['lng'],
                vehicle_count=vehicle_count,
                average_speed=average_speed,
                congestion_level=congestion_level
            )
            
            db.session.add(traffic_data)
            created_data.append(traffic_data.to_dict())
        
        db.session.commit()
        
        return jsonify({
            'message': f'Successfully created {count} simulated traffic data entries',
            'data': created_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500