from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class TrafficData(db.Model):
    __tablename__ = 'traffic_data'
    
    id = db.Column(db.Integer, primary_key=True)
    sensor_id = db.Column(db.String(50), nullable=False)
    location_lat = db.Column(db.Float, nullable=False)
    location_lng = db.Column(db.Float, nullable=False)
    vehicle_count = db.Column(db.Integer, nullable=False)
    average_speed = db.Column(db.Float, nullable=False)
    congestion_level = db.Column(db.String(20), nullable=False)  # LOW, MEDIUM, HIGH
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'sensor_id': self.sensor_id,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'vehicle_count': self.vehicle_count,
            'average_speed': self.average_speed,
            'congestion_level': self.congestion_level,
            'timestamp': self.timestamp.isoformat()
        }

class TrafficIncident(db.Model):
    __tablename__ = 'traffic_incidents'
    
    id = db.Column(db.Integer, primary_key=True)
    incident_type = db.Column(db.String(50), nullable=False)  # ACCIDENT, CONSTRUCTION, WEATHER
    location_lat = db.Column(db.Float, nullable=False)
    location_lng = db.Column(db.Float, nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='ACTIVE')  # ACTIVE, RESOLVED
    reported_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'incident_type': self.incident_type,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'severity': self.severity,
            'description': self.description,
            'status': self.status,
            'reported_at': self.reported_at.isoformat(),
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None
        }