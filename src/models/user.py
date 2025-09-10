from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    company = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    disc_assessments = db.relationship('DiscAssessment', backref='user', lazy=True, cascade='all, delete-orphan')
    mental_health_assessments = db.relationship('MentalHealthAssessment', backref='user', lazy=True, cascade='all, delete-orphan')
    consent_management = db.relationship('ConsentManagement', backref='user', lazy=True, cascade='all, delete-orphan')
    professional_oversight = db.relationship('ProfessionalOversight', backref='user', lazy=True, cascade='all, delete-orphan')
    personalized_insights = db.relationship('PersonalizedInsight', backref='user', lazy=True, cascade='all, delete-orphan')
    ai_governance = db.relationship('AIGovernance', backref='user', lazy=True, cascade='all, delete-orphan')
    data_processing_logs = db.relationship('DataProcessingLog', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<User {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }