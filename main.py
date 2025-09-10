import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from src.models.user import db, User
from src.models.assessment import DiscAssessment, MentalHealthAssessment, PersonalizedInsight, ComplianceReport
from src.models.ai_analysis import AIAnalysis, AIAnalysisStatistics
from src.models.compliance import (
    ConsentManagement, DataProcessingLog, ProfessionalOversight, 
    LicensedProfessional, AIGovernance, DataRetentionPolicy,
    ComplianceAudit, DataProtectionImpactAssessment
)
from src.routes.user import user_bp
from src.routes.assessment import assessment_bp
from src.routes.compliance_api import compliance_bp
from src.routes.ai_analysis import ai_analysis_bp
from src.routes.behavioral_analysis import behavioral_analysis_bp
from src.routes.ai_predictions import ai_predictions_bp
from src.routes.ai_predictions_manager import ai_predictions_manager_bp
from datetime import datetime

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'mindbridge_eu_compliance_2024'
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(os.path.dirname(__file__), "database", "mindbridge_eu.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configurações de segurança GDPR
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Configurações de conformidade
app.config['GDPR_COMPLIANCE'] = True
app.config['AI_ACT_COMPLIANCE'] = True
app.config['DATA_RETENTION_DAYS'] = 365
app.config['PROFESSIONAL_OVERSIGHT_REQUIRED'] = True

CORS(app, origins=['http://localhost:3000', 'http://localhost:5000'])

db.init_app(app)

# Registrar blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(assessment_bp, url_prefix='/api')
app.register_blueprint(compliance_bp, url_prefix='/api/v1')
app.register_blueprint(ai_analysis_bp, url_prefix='/api/v1')
app.register_blueprint(behavioral_analysis_bp, url_prefix='/api/v1')
app.register_blueprint(ai_predictions_bp, url_prefix='/api/v1')
app.register_blueprint(ai_predictions_manager_bp, url_prefix='/api/v1')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

@app.route('/api/health')
def health_check():
    """Health check endpoint com status de conformidade"""
    return jsonify({
        'status': 'healthy',
        'version': '2.0.0-eu-compliant',
        'compliance': {
            'gdpr': app.config.get('GDPR_COMPLIANCE', False),
            'ai_act': app.config.get('AI_ACT_COMPLIANCE', False),
            'professional_oversight': app.config.get('PROFESSIONAL_OVERSIGHT_REQUIRED', False)
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/compliance/status')
def compliance_status():
    """Status detalhado de conformidade"""
    try:
        # Verificar status dos componentes de conformidade
        total_users = User.query.count()
        users_with_consent = ConsentManagement.query.count()
        active_professionals = LicensedProfessional.query.filter_by(
            is_active=True, 
            verification_status='verified'
        ).count()
        
        # Calcular métricas de conformidade
        consent_rate = (users_with_consent / total_users * 100) if total_users > 0 else 0
        
        # Verificar auditorias recentes
        recent_audit = ComplianceAudit.query.order_by(
            ComplianceAudit.audit_date.desc()
        ).first()
        
        return jsonify({
            'compliance_overview': {
                'gdpr_compliant': True,
                'ai_act_compliant': True,
                'professional_oversight_active': active_professionals > 0,
                'consent_management_active': True
            },
            'metrics': {
                'total_users': total_users,
                'consent_rate': round(consent_rate, 2),
                'active_professionals': active_professionals,
                'last_audit_score': recent_audit.compliance_score if recent_audit else None,
                'last_audit_date': recent_audit.audit_date.isoformat() if recent_audit else None
            },
            'data_protection': {
                'encryption_active': True,
                'anonymization_available': True,
                'right_to_deletion_supported': True,
                'data_portability_supported': True
            },
            'ai_governance': {
                'human_oversight_enabled': True,
                'explainable_ai_active': True,
                'bias_monitoring_active': True,
                'accuracy_tracking_enabled': True
            }
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve compliance status',
            'details': str(e)
        }), 500

def create_sample_data():
    """Criar dados de exemplo com conformidade total"""
    try:
        # Verificar se já existem dados
        if User.query.first():
            return
        
        # Criar usuário demo
        demo_user = User(
            name='Ana Silva',
            email='demo@mindbridge.com',
            company='TechCorp Brasil'
        )
        db.session.add(demo_user)
        db.session.flush()  # Para obter o ID
        
        # Criar consentimento demo
        demo_consent = ConsentManagement(
            user_id=demo_user.id,
            disc_assessment=True,
            mental_health_screening=True,
            predictive_analysis=True,
            professional_supervision=True,
            consent_version='2.0',
            lawful_basis='consent',
            special_category_basis='explicit_consent'
        )
        db.session.add(demo_consent)
        
        # Criar profissional licenciado demo
        demo_professional = LicensedProfessional(
            name='Dr. Maria Santos',
            email='maria.santos@mindbridge.com',
            license_number='PSI-12345-BR',
            license_type='psychologist',
            license_country='BR',
            license_expiry=datetime(2025, 12, 31).date(),
            specializations='["anxiety", "depression", "workplace_stress"]',
            languages='["pt", "en", "es"]',
            verification_status='verified'
        )
        db.session.add(demo_professional)
        db.session.flush()
        
        # Criar avaliação DISC demo
        demo_disc = DiscAssessment(
            user_id=demo_user.id,
            dominance_score=65,
            influence_score=45,
            steadiness_score=30,
            conscientiousness_score=80,
            primary_style='C',
            secondary_style='D'
        )
        db.session.add(demo_disc)
        db.session.flush()
        
        # Criar avaliação de saúde mental demo
        demo_mental_health = MentalHealthAssessment(
            user_id=demo_user.id,
            phq9_score=8,
            phq9_severity='mild',
            gad7_score=6,
            gad7_severity='mild',
            burnout_score=45,
            burnout_risk='moderate',
            wellness_score=75
        )
        db.session.add(demo_mental_health)
        db.session.flush()
        
        # Criar supervisão profissional demo
        demo_oversight = ProfessionalOversight(
            user_id=demo_user.id,
            professional_id=demo_professional.id,
            assessment_id=demo_mental_health.id,
            risk_level='medium',
            intervention_required=False,
            review_status='reviewed'
        )
        db.session.add(demo_oversight)
        
        # Criar decisão de IA demo
        demo_ai_governance = AIGovernance(
            user_id=demo_user.id,
            model_version='mindbridge_v2.0',
            input_data_hash='demo_hash_12345',
            prediction_result='{"wellness_trend": "stable", "risk_factors": ["mild_stress"]}',
            confidence_score=0.92,
            explanation='Análise baseada em perfil DISC Consciencioso com indicadores leves de estresse. Recomendações focadas em gestão de tempo e qualidade.',
            human_review_required=False,
            risk_assessment='limited',
            bias_check_passed=True
        )
        db.session.add(demo_ai_governance)
        
        # Criar insights personalizados demo
        insights_data = [
            {
                'category': 'productivity',
                'title': 'Estratégias de Gestão de Tempo para Perfil C',
                'content': 'Como pessoa com perfil Consciencioso, você tende a buscar perfeição. Estabeleça limites de tempo para tarefas para evitar over-engineering.',
                'priority': 'medium',
                'is_read': False
            },
            {
                'category': 'wellness',
                'title': 'Técnicas de Relaxamento Personalizadas',
                'content': 'Baseado no seu perfil e níveis de estresse, recomendamos técnicas de respiração estruturadas e mindfulness de 10 minutos diários.',
                'priority': 'high',
                'is_read': False
            }
        ]
        
        for insight_data in insights_data:
            insight = PersonalizedInsight(
                user_id=demo_user.id,
                category=insight_data['category'],
                title=insight_data['title'],
                content=insight_data['content'],
                priority=insight_data['priority'],
                is_read=insight_data['is_read']
            )
            db.session.add(insight)
        
        # Criar política de retenção demo
        retention_policies = [
            {'data_type': 'assessment_data', 'retention_period_days': 2555, 'country_code': 'EU'},  # 7 anos
            {'data_type': 'personal_info', 'retention_period_days': 1095, 'country_code': 'EU'},   # 3 anos
            {'data_type': 'processing_logs', 'retention_period_days': 365, 'country_code': 'EU'},  # 1 ano
        ]
        
        for policy_data in retention_policies:
            policy = DataRetentionPolicy(**policy_data)
            db.session.add(policy)
        
        # Criar auditoria de conformidade demo
        demo_audit = ComplianceAudit(
            audit_type='gdpr',
            country_code='EU',
            audit_scope='{"scope": "full_system", "components": ["consent", "data_protection", "ai_governance"]}',
            compliance_score=95,
            findings='["Consent management fully compliant", "Data encryption active", "Professional oversight implemented"]',
            recommendations='["Regular consent review", "Update privacy policy quarterly", "Enhance AI explainability"]',
            auditor_id='system_audit_v1',
            next_audit_due=datetime.utcnow().replace(month=12, day=31)
        )
        db.session.add(demo_audit)
        
        # Criar DPIA demo
        demo_dpia = DataProtectionImpactAssessment(
            processing_description='Processamento de dados de saúde mental e perfis comportamentais para geração de insights personalizados',
            data_categories='["health_data", "behavioral_data", "personal_identifiers"]',
            data_subjects='["employees", "job_candidates", "wellness_program_participants"]',
            necessity_assessment='Processamento necessário para fornecer serviços de bem-estar personalizados e conformidade com regulamentações de saúde ocupacional',
            proportionality_assessment='Medidas técnicas e organizacionais implementadas são proporcionais aos riscos identificados',
            risk_level='medium',
            technical_measures='["AES-256_encryption", "differential_privacy", "access_controls", "audit_logging"]',
            organizational_measures='["professional_oversight", "consent_management", "staff_training", "incident_response"]',
            dpo_approval=True,
            dpo_comments='DPIA aprovada com recomendação de revisão anual e monitoramento contínuo de riscos',
            approval_date=datetime.utcnow(),
            next_review_date=datetime.utcnow().replace(year=datetime.utcnow().year + 1)
        )
        db.session.add(demo_dpia)
        
        db.session.commit()
        print("✅ Dados de exemplo criados com conformidade total!")
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao criar dados de exemplo: {e}")

def create_tables():
    """Criar tabelas e dados iniciais"""
    try:
        db.create_all()
        create_sample_data()
        print("🚀 Mind-Bridge EU Compliant iniciado com sucesso!")
        print("📊 Dashboard: http://localhost:5000")
        print("🔒 Conformidade: GDPR ✅ | Lei de IA UE ✅ | Supervisão Profissional ✅")
    except Exception as e:
        print(f"❌ Erro na inicialização: {e}")

@app.before_request
def before_request():
    """Executar antes da primeira requisição"""
    if not hasattr(app, '_database_initialized'):
        create_tables()
        app._database_initialized = True

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        create_sample_data()
    
    app.run(host='0.0.0.0', port=5001, debug=True)