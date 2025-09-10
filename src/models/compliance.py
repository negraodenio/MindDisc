from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from .user import db

class ConsentManagement(db.Model):
    __tablename__ = 'consent_management'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Tipos de consentimento específicos
    disc_assessment = db.Column(db.Boolean, default=False)
    mental_health_screening = db.Column(db.Boolean, default=False)
    predictive_analysis = db.Column(db.Boolean, default=False)
    professional_supervision = db.Column(db.Boolean, default=False)
    data_sharing_research = db.Column(db.Boolean, default=False)
    marketing_communications = db.Column(db.Boolean, default=False)
    
    # Metadados de conformidade GDPR
    consent_version = db.Column(db.String(10), default='1.0')
    consent_date = db.Column(db.DateTime, default=datetime.utcnow)
    consent_ip = db.Column(db.String(45), nullable=True)  # IPv6 suporte
    consent_user_agent = db.Column(db.String(500), nullable=True)
    lawful_basis = db.Column(db.String(50), default='consent')  # consent, legitimate_interest, etc.
    special_category_basis = db.Column(db.String(50), nullable=True)  # explicit_consent para dados de saúde
    
    # Revogação de consentimento
    revoked_at = db.Column(db.DateTime, nullable=True)
    revocation_reason = db.Column(db.String(500), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<ConsentManagement {self.user_id}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'disc_assessment': self.disc_assessment,
            'mental_health_screening': self.mental_health_screening,
            'predictive_analysis': self.predictive_analysis,
            'professional_supervision': self.professional_supervision,
            'data_sharing_research': self.data_sharing_research,
            'marketing_communications': self.marketing_communications,
            'consent_version': self.consent_version,
            'consent_date': self.consent_date.isoformat() if self.consent_date else None,
            'lawful_basis': self.lawful_basis,
            'special_category_basis': self.special_category_basis,
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DataProcessingLog(db.Model):
    __tablename__ = 'data_processing_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    processing_purpose = db.Column(db.String(100), nullable=False)
    data_categories = db.Column(db.Text, nullable=False)  # JSON array
    processing_legal_basis = db.Column(db.String(50), nullable=False)
    retention_period = db.Column(db.Integer, nullable=True)  # dias
    
    processor_name = db.Column(db.String(100), nullable=True)
    processor_role = db.Column(db.String(50), nullable=True)
    processing_timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Trilha de auditoria
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(500), nullable=True)
    session_id = db.Column(db.String(100), nullable=True)
    
    def __repr__(self):
        return f'<DataProcessingLog {self.processing_purpose}>'

class ProfessionalOversight(db.Model):
    __tablename__ = 'professional_oversight'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey('licensed_professionals.id'), nullable=False)
    assessment_id = db.Column(db.Integer, nullable=True)  # Referência genérica para avaliações
    
    risk_level = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    intervention_required = db.Column(db.Boolean, default=False)
    intervention_type = db.Column(db.String(100), nullable=True)
    intervention_notes = db.Column(db.Text, nullable=True)
    
    review_date = db.Column(db.DateTime, default=datetime.utcnow)
    next_review_date = db.Column(db.DateTime, nullable=True)
    review_status = db.Column(db.String(20), default='pending')  # pending, reviewed, closed
    
    # Conformidade com regulamentações profissionais
    professional_notes = db.Column(db.Text, nullable=True)
    confidentiality_level = db.Column(db.String(20), default='high')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ProfessionalOversight {self.user_id} - {self.risk_level}>'

class LicensedProfessional(db.Model):
    __tablename__ = 'licensed_professionals'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    
    # Credenciais profissionais
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_type = db.Column(db.String(50), nullable=False)  # psychologist, psychiatrist, etc.
    license_country = db.Column(db.String(2), nullable=False)
    license_expiry = db.Column(db.Date, nullable=False)
    
    # Especializações e capacidades
    specializations = db.Column(db.Text, nullable=True)  # JSON array
    languages = db.Column(db.Text, nullable=True)  # JSON array
    
    # Status de verificação
    verification_status = db.Column(db.String(20), default='pending')  # pending, verified, suspended
    verification_date = db.Column(db.DateTime, nullable=True)
    verification_notes = db.Column(db.Text, nullable=True)
    
    # Status ativo/inativo
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    oversight_cases = db.relationship('ProfessionalOversight', backref='professional', lazy=True)
    
    def __repr__(self):
        return f'<LicensedProfessional {self.name}>'

class AIGovernance(db.Model):
    __tablename__ = 'ai_governance'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Identificação do modelo e versão
    model_version = db.Column(db.String(50), nullable=False)
    model_type = db.Column(db.String(50), default='behavioral_analysis')
    
    # Dados de entrada e saída
    input_data_hash = db.Column(db.String(256), nullable=False)
    prediction_result = db.Column(db.Text, nullable=False)  # JSON
    confidence_score = db.Column(db.Float, nullable=False)
    
    # Explicabilidade (EU AI Act requisito)
    explanation = db.Column(db.Text, nullable=True)
    feature_importance = db.Column(db.Text, nullable=True)  # JSON
    
    # Supervisão humana
    human_review_required = db.Column(db.Boolean, default=False)
    human_reviewer_id = db.Column(db.Integer, nullable=True)
    human_review_date = db.Column(db.DateTime, nullable=True)
    human_review_notes = db.Column(db.Text, nullable=True)
    
    # Classificação de risco (EU AI Act)
    risk_assessment = db.Column(db.String(20), default='limited')  # minimal, limited, high, prohibited
    
    # Monitoramento de viés
    bias_check_passed = db.Column(db.Boolean, default=True)
    bias_metrics = db.Column(db.Text, nullable=True)  # JSON
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<AIGovernance {self.model_version} - {self.user_id}>'

class DataRetentionPolicy(db.Model):
    __tablename__ = 'data_retention_policies'
    
    id = db.Column(db.Integer, primary_key=True)
    data_type = db.Column(db.String(50), nullable=False)
    retention_period_days = db.Column(db.Integer, nullable=False)
    country_code = db.Column(db.String(2), default='EU')
    
    # Políticas específicas
    auto_deletion_enabled = db.Column(db.Boolean, default=True)
    anonymization_after_days = db.Column(db.Integer, nullable=True)
    
    # Exceções legais
    legal_hold_exceptions = db.Column(db.Text, nullable=True)  # JSON
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<DataRetentionPolicy {self.data_type} - {self.retention_period_days} days>'

class ComplianceAudit(db.Model):
    __tablename__ = 'compliance_audits'
    
    id = db.Column(db.Integer, primary_key=True)
    audit_type = db.Column(db.String(50), nullable=False)  # gdpr, ai_act, professional_standards
    country_code = db.Column(db.String(2), default='EU')
    
    audit_date = db.Column(db.DateTime, default=datetime.utcnow)
    audit_scope = db.Column(db.Text, nullable=False)  # JSON
    
    # Resultados
    compliance_score = db.Column(db.Float, nullable=False)  # 0-100
    findings = db.Column(db.Text, nullable=True)  # JSON array
    recommendations = db.Column(db.Text, nullable=True)  # JSON array
    
    # Auditor
    auditor_id = db.Column(db.String(100), nullable=False)
    auditor_type = db.Column(db.String(20), default='internal')  # internal, external, regulatory
    
    # Próxima auditoria
    next_audit_due = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ComplianceAudit {self.audit_type} - {self.compliance_score}>'

class DataProtectionImpactAssessment(db.Model):
    __tablename__ = 'data_protection_impact_assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Descrição do processamento
    processing_description = db.Column(db.Text, nullable=False)
    data_categories = db.Column(db.Text, nullable=False)  # JSON array
    data_subjects = db.Column(db.Text, nullable=False)  # JSON array
    
    # Avaliação de necessidade e proporcionalidade
    necessity_assessment = db.Column(db.Text, nullable=False)
    proportionality_assessment = db.Column(db.Text, nullable=False)
    
    # Avaliação de riscos
    risk_level = db.Column(db.String(20), nullable=False)  # low, medium, high
    identified_risks = db.Column(db.Text, nullable=True)  # JSON array
    
    # Medidas de mitigação
    technical_measures = db.Column(db.Text, nullable=True)  # JSON array
    organizational_measures = db.Column(db.Text, nullable=True)  # JSON array
    
    # Aprovação DPO
    dpo_approval = db.Column(db.Boolean, default=False)
    dpo_comments = db.Column(db.Text, nullable=True)
    approval_date = db.Column(db.DateTime, nullable=True)
    
    # Revisão periódica
    next_review_date = db.Column(db.DateTime, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<DPIA {self.risk_level} risk>'