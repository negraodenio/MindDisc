from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import db
import json

class AIAnalysis(db.Model):
    """Modelo para armazenar análises de correlação DISC x Saúde Mental com IA"""
    __tablename__ = 'ai_analyses'
    
    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.String(50), unique=True, nullable=False)  # UUID único
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Referências para avaliações base
    disc_assessment_id = db.Column(db.Integer, db.ForeignKey('disc_assessments.id'), nullable=True)
    mental_health_assessment_id = db.Column(db.Integer, db.ForeignKey('mental_health_assessments.id'), nullable=True)
    
    # Dados de entrada (JSON)
    disc_data = db.Column(db.Text, nullable=False)  # JSON com dados DISC
    mental_health_data = db.Column(db.Text, nullable=False)  # JSON com dados de saúde mental
    user_context = db.Column(db.Text, nullable=True)  # JSON com contexto do usuário
    
    # Resultados da análise
    overall_risk_score = db.Column(db.Float, nullable=False)  # 0-100
    risk_level = db.Column(db.String(20), nullable=False)  # low, moderate, high, critical
    confidence_score = db.Column(db.Float, nullable=False)  # 0-100
    
    # Análise de correlações (JSON)
    correlation_analysis = db.Column(db.Text, nullable=False)  # Análise detalhada da IA
    risk_factors = db.Column(db.Text, nullable=True)  # Lista de fatores de risco identificados
    protective_factors = db.Column(db.Text, nullable=True)  # Lista de fatores de proteção
    
    # Recomendações personalizadas (JSON)
    personalized_recommendations = db.Column(db.Text, nullable=False)
    intervention_priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    
    # Supervisão profissional
    professional_oversight_required = db.Column(db.Boolean, default=False)
    professional_review_status = db.Column(db.String(20), default='pending')  # pending, reviewed, approved
    professional_notes = db.Column(db.Text, nullable=True)
    
    # Conformidade e governança
    ai_model_version = db.Column(db.String(50), nullable=False)
    openai_model_used = db.Column(db.String(50), nullable=True)  # gpt-4, gpt-3.5-turbo
    processing_time_ms = db.Column(db.Integer, nullable=True)
    
    # Auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)  # Para compliance GDPR
    
    def __repr__(self):
        return f'<AIAnalysis {self.analysis_id} - {self.risk_level}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'user_id': self.user_id,
            'disc_assessment_id': self.disc_assessment_id,
            'mental_health_assessment_id': self.mental_health_assessment_id,
            'disc_data': json.loads(self.disc_data) if self.disc_data else {},
            'mental_health_data': json.loads(self.mental_health_data) if self.mental_health_data else {},
            'user_context': json.loads(self.user_context) if self.user_context else {},
            'overall_risk_score': self.overall_risk_score,
            'risk_level': self.risk_level,
            'confidence_score': self.confidence_score,
            'correlation_analysis': json.loads(self.correlation_analysis) if self.correlation_analysis else {},
            'risk_factors': json.loads(self.risk_factors) if self.risk_factors else [],
            'protective_factors': json.loads(self.protective_factors) if self.protective_factors else [],
            'personalized_recommendations': json.loads(self.personalized_recommendations) if self.personalized_recommendations else [],
            'intervention_priority': self.intervention_priority,
            'professional_oversight_required': self.professional_oversight_required,
            'professional_review_status': self.professional_review_status,
            'professional_notes': self.professional_notes,
            'ai_model_version': self.ai_model_version,
            'openai_model_used': self.openai_model_used,
            'processing_time_ms': self.processing_time_ms,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }
    
    @staticmethod
    def get_risk_multipliers():
        """Multiplicadores de risco baseados em pesquisa científica"""
        return {
            'D': {
                'burnout': 1.3,     # 30% maior risco
                'anxiety': 1.1,     # 10% maior risco  
                'depression': 0.9   # 10% menor risco
            },
            'I': {
                'burnout': 1.1,     # 10% maior risco
                'anxiety': 1.2,     # 20% maior risco
                'depression': 1.4   # 40% maior risco
            },
            'S': {
                'burnout': 1.2,     # 20% maior risco
                'anxiety': 1.4,     # 40% maior risco
                'depression': 1.1   # 10% maior risco
            },
            'C': {
                'burnout': 1.1,     # 10% maior risco
                'anxiety': 1.5,     # 50% maior risco
                'depression': 1.3   # 30% maior risco
            }
        }


class AIAnalysisStatistics(db.Model):
    """Estatísticas agregadas das análises de IA para insights do sistema"""
    __tablename__ = 'ai_analysis_statistics'
    
    id = db.Column(db.Integer, primary_key=True)
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    
    # Contadores por perfil DISC
    total_analyses = db.Column(db.Integer, default=0)
    disc_d_count = db.Column(db.Integer, default=0)
    disc_i_count = db.Column(db.Integer, default=0)
    disc_s_count = db.Column(db.Integer, default=0)
    disc_c_count = db.Column(db.Integer, default=0)
    
    # Distribuição de risco
    risk_low_count = db.Column(db.Integer, default=0)
    risk_moderate_count = db.Column(db.Integer, default=0)
    risk_high_count = db.Column(db.Integer, default=0)
    risk_critical_count = db.Column(db.Integer, default=0)
    
    # Métricas de qualidade
    average_confidence_score = db.Column(db.Float, default=0.0)
    professional_oversight_percentage = db.Column(db.Float, default=0.0)
    average_processing_time_ms = db.Column(db.Integer, default=0)
    
    # Precisão preditiva (quando disponível)
    prediction_accuracy_burnout = db.Column(db.Float, nullable=True)
    prediction_accuracy_anxiety = db.Column(db.Float, nullable=True)
    prediction_accuracy_depression = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'period_start': self.period_start.isoformat(),
            'period_end': self.period_end.isoformat(),
            'total_analyses': self.total_analyses,
            'disc_profile_distribution': {
                'D': self.disc_d_count,
                'I': self.disc_i_count,
                'S': self.disc_s_count,
                'C': self.disc_c_count
            },
            'risk_distribution': {
                'low': self.risk_low_count,
                'moderate': self.risk_moderate_count,
                'high': self.risk_high_count,
                'critical': self.risk_critical_count
            },
            'quality_metrics': {
                'average_confidence_score': self.average_confidence_score,
                'professional_oversight_percentage': self.professional_oversight_percentage,
                'average_processing_time_ms': self.average_processing_time_ms
            },
            'prediction_accuracy': {
                'burnout': self.prediction_accuracy_burnout,
                'anxiety': self.prediction_accuracy_anxiety,
                'depression': self.prediction_accuracy_depression
            },
            'created_at': self.created_at.isoformat()
        }