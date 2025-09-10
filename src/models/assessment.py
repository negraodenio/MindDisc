from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db

class DiscAssessment(db.Model):
    __tablename__ = 'disc_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    dominance_score = db.Column(db.Integer, nullable=False)
    influence_score = db.Column(db.Integer, nullable=False)
    steadiness_score = db.Column(db.Integer, nullable=False)
    conscientiousness_score = db.Column(db.Integer, nullable=False)
    primary_style = db.Column(db.String(1), nullable=False)
    secondary_style = db.Column(db.String(1), nullable=True)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<DiscAssessment {self.user_id} - {self.primary_style}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'dominance_score': self.dominance_score,
            'influence_score': self.influence_score,
            'steadiness_score': self.steadiness_score,
            'conscientiousness_score': self.conscientiousness_score,
            'primary_style': self.primary_style,
            'secondary_style': self.secondary_style,
            'assessment_date': self.assessment_date.isoformat() if self.assessment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class MentalHealthAssessment(db.Model):
    __tablename__ = 'mental_health_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    phq9_score = db.Column(db.Integer, nullable=True)
    phq9_severity = db.Column(db.String(20), nullable=True)
    gad7_score = db.Column(db.Integer, nullable=True)
    gad7_severity = db.Column(db.String(20), nullable=True)
    burnout_score = db.Column(db.Integer, nullable=True)
    burnout_risk = db.Column(db.String(20), nullable=True)
    wellness_score = db.Column(db.Integer, nullable=True)
    assessment_date = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<MentalHealthAssessment {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'phq9_score': self.phq9_score,
            'phq9_severity': self.phq9_severity,
            'gad7_score': self.gad7_score,
            'gad7_severity': self.gad7_severity,
            'burnout_score': self.burnout_score,
            'burnout_risk': self.burnout_risk,
            'wellness_score': self.wellness_score,
            'assessment_date': self.assessment_date.isoformat() if self.assessment_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PersonalizedInsight(db.Model):
    __tablename__ = 'personalized_insights'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category = db.Column(db.String(50), nullable=False)  # productivity, wellness, communication, etc.
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    read_at = db.Column(db.DateTime, nullable=True)
    
    def __repr__(self):
        return f'<PersonalizedInsight {self.title}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'category': self.category,
            'title': self.title,
            'content': self.content,
            'priority': self.priority,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }

class ComplianceReport(db.Model):
    __tablename__ = 'compliance_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    report_type = db.Column(db.String(50), nullable=False)  # gdpr, ai_act, professional_oversight
    country_code = db.Column(db.String(2), default='EU')
    report_data = db.Column(db.Text, nullable=False)  # JSON string
    compliance_score = db.Column(db.Float, nullable=True)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)
    generated_by = db.Column(db.String(100), nullable=True)
    
    def __repr__(self):
        return f'<ComplianceReport {self.report_type}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'report_type': self.report_type,
            'country_code': self.country_code,
            'report_data': self.report_data,
            'compliance_score': self.compliance_score,
            'generated_at': self.generated_at.isoformat() if self.generated_at else None,
            'generated_by': self.generated_by
        }