from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class TrafficLight(db.Model):
    __tablename__ = 'traffic_lights'
    
    id = db.Column(db.Integer, primary_key=True)
    light_id = db.Column(db.String(50), unique=True, nullable=False)
    location_lat = db.Column(db.Float, nullable=False)
    location_lng = db.Column(db.Float, nullable=False)
    intersection_name = db.Column(db.String(100))
    current_state = db.Column(db.String(20), default='GREEN')  # RED, YELLOW, GREEN
    cycle_duration = db.Column(db.Integer, default=120)  # seconds
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'light_id': self.light_id,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'intersection_name': self.intersection_name,
            'current_state': self.current_state,
            'cycle_duration': self.cycle_duration,
            'last_updated': self.last_updated.isoformat(),
            'is_active': self.is_active
        }

class TrafficSignal(db.Model):
    __tablename__ = 'traffic_signals'
    
    id = db.Column(db.Integer, primary_key=True)
    signal_id = db.Column(db.String(50), unique=True, nullable=False)
    signal_type = db.Column(db.String(30), nullable=False)  # SPEED_LIMIT, LANE_CLOSURE, REROUTE
    location_lat = db.Column(db.Float, nullable=False)
    location_lng = db.Column(db.Float, nullable=False)
    message = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    priority = db.Column(db.String(20), default='MEDIUM')  # LOW, MEDIUM, HIGH, CRITICAL
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'signal_id': self.signal_id,
            'signal_type': self.signal_type,
            'location_lat': self.location_lat,
            'location_lng': self.location_lng,
            'message': self.message,
            'is_active': self.is_active,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

class ControlAction(db.Model):
    __tablename__ = 'control_actions'
    
    id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(50), nullable=False)  # LIGHT_CHANGE, SIGNAL_UPDATE, REROUTE
    target_id = db.Column(db.String(50), nullable=False)  # ID of the controlled entity
    action_data = db.Column(db.Text)  # JSON data for the action
    status = db.Column(db.String(20), default='PENDING')  # PENDING, EXECUTED, FAILED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    executed_at = db.Column(db.DateTime)
    created_by = db.Column(db.String(50), default='SYSTEM')
    
    def to_dict(self):
        return {
            'id': self.id,
            'action_type': self.action_type,
            'target_id': self.target_id,
            'action_data': self.action_data,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'executed_at': self.executed_at.isoformat() if self.executed_at else None,
            'created_by': self.created_by
        }