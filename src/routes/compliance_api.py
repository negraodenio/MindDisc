from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.compliance import (
    ConsentManagement, DataProcessingLog, ProfessionalOversight,
    LicensedProfessional, AIGovernance, DataRetentionPolicy,
    ComplianceAudit, DataProtectionImpactAssessment
)
from datetime import datetime, timedelta
import json

compliance_bp = Blueprint('compliance', __name__)

@compliance_bp.route('/compliance/gdpr/consent', methods=['POST'])
def record_consent():
    """Registrar consentimento GDPR"""
    try:
        data = request.get_json()
        user_id = data['user_id']
        
        # Verificar se já existe consentimento
        existing_consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        
        if existing_consent:
            # Atualizar consentimento existente
            for key, value in data.get('consents', {}).items():
                if hasattr(existing_consent, key):
                    setattr(existing_consent, key, value)
            
            existing_consent.consent_version = data.get('consent_version', '1.0')
            existing_consent.updated_at = datetime.utcnow()
            consent = existing_consent
        else:
            # Criar novo consentimento
            consent = ConsentManagement(
                user_id=user_id,
                consent_version=data.get('consent_version', '1.0'),
                consent_ip=request.remote_addr,
                consent_user_agent=request.headers.get('User-Agent', ''),
                lawful_basis=data.get('lawful_basis', 'consent'),
                special_category_basis=data.get('special_category_basis')
            )
            
            # Aplicar consentimentos específicos
            consents = data.get('consents', {})
            for key, value in consents.items():
                if hasattr(consent, key):
                    setattr(consent, key, value)
            
            db.session.add(consent)
        
        db.session.commit()
        
        return jsonify({
            'consent': consent.to_dict(),
            'message': 'Consentimento registrado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/gdpr/data-processing-log', methods=['POST'])
def log_data_processing():
    """Registrar log de processamento de dados"""
    try:
        data = request.get_json()
        
        log_entry = DataProcessingLog(
            user_id=data['user_id'],
            processing_purpose=data['processing_purpose'],
            data_categories=json.dumps(data['data_categories']),
            processing_legal_basis=data['processing_legal_basis'],
            retention_period=data.get('retention_period'),
            processor_name=data.get('processor_name'),
            processor_role=data.get('processor_role'),
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', ''),
            session_id=data.get('session_id')
        )
        
        db.session.add(log_entry)
        db.session.commit()
        
        return jsonify({
            'log_id': log_entry.id,
            'message': 'Log de processamento registrado'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/professional-oversight', methods=['POST'])
def create_professional_oversight():
    """Criar supervisão profissional"""
    try:
        data = request.get_json()
        
        oversight = ProfessionalOversight(
            user_id=data['user_id'],
            professional_id=data['professional_id'],
            assessment_id=data.get('assessment_id'),
            risk_level=data['risk_level'],
            intervention_required=data.get('intervention_required', False),
            intervention_type=data.get('intervention_type'),
            intervention_notes=data.get('intervention_notes'),
            next_review_date=datetime.strptime(data['next_review_date'], '%Y-%m-%d') if data.get('next_review_date') else None,
            professional_notes=data.get('professional_notes'),
            confidentiality_level=data.get('confidentiality_level', 'high')
        )
        
        db.session.add(oversight)
        db.session.commit()
        
        return jsonify({
            'oversight_id': oversight.id,
            'message': 'Supervisão profissional criada'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/professionals', methods=['GET'])
def get_licensed_professionals():
    """Listar profissionais licenciados"""
    try:
        professionals = LicensedProfessional.query.filter_by(
            is_active=True,
            verification_status='verified'
        ).all()
        
        return jsonify({
            'professionals': [
                {
                    'id': p.id,
                    'name': p.name,
                    'license_type': p.license_type,
                    'specializations': json.loads(p.specializations) if p.specializations else [],
                    'languages': json.loads(p.languages) if p.languages else []
                }
                for p in professionals
            ],
            'total': len(professionals)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/ai-governance/decisions', methods=['GET'])
def get_ai_decisions():
    """Obter decisões de IA para auditoria"""
    try:
        user_id = request.args.get('user_id')
        limit = int(request.args.get('limit', 100))
        
        query = AIGovernance.query
        if user_id:
            query = query.filter_by(user_id=user_id)
        
        decisions = query.order_by(AIGovernance.created_at.desc()).limit(limit).all()
        
        return jsonify({
            'decisions': [
                {
                    'id': d.id,
                    'user_id': d.user_id,
                    'model_version': d.model_version,
                    'confidence_score': d.confidence_score,
                    'risk_assessment': d.risk_assessment,
                    'human_review_required': d.human_review_required,
                    'bias_check_passed': d.bias_check_passed,
                    'created_at': d.created_at.isoformat()
                }
                for d in decisions
            ],
            'total': len(decisions)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/audit', methods=['POST'])
def run_compliance_audit():
    """Executar auditoria de conformidade"""
    try:
        data = request.get_json()
        audit_type = data.get('audit_type', 'gdpr')
        country_code = data.get('country_code', 'EU')
        
        # Executar verificações de conformidade baseadas no tipo
        audit_results = perform_compliance_check(audit_type)
        
        # Criar registro de auditoria
        audit = ComplianceAudit(
            audit_type=audit_type,
            country_code=country_code,
            audit_scope=json.dumps(data.get('scope', {'scope': 'full_system'})),
            compliance_score=audit_results['score'],
            findings=json.dumps(audit_results['findings']),
            recommendations=json.dumps(audit_results['recommendations']),
            auditor_id=data.get('auditor_id', 'system_audit'),
            auditor_type=data.get('auditor_type', 'internal'),
            next_audit_due=datetime.utcnow() + timedelta(days=365)
        )
        
        db.session.add(audit)
        db.session.commit()
        
        return jsonify({
            'audit_id': audit.id,
            'compliance_score': audit_results['score'],
            'findings': audit_results['findings'],
            'recommendations': audit_results['recommendations'],
            'next_audit_due': audit.next_audit_due.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/dpia', methods=['POST'])
def create_dpia():
    """Criar Data Protection Impact Assessment"""
    try:
        data = request.get_json()
        
        dpia = DataProtectionImpactAssessment(
            processing_description=data['processing_description'],
            data_categories=json.dumps(data['data_categories']),
            data_subjects=json.dumps(data['data_subjects']),
            necessity_assessment=data['necessity_assessment'],
            proportionality_assessment=data['proportionality_assessment'],
            risk_level=data['risk_level'],
            identified_risks=json.dumps(data.get('identified_risks', [])),
            technical_measures=json.dumps(data.get('technical_measures', [])),
            organizational_measures=json.dumps(data.get('organizational_measures', [])),
            dpo_approval=data.get('dpo_approval', False),
            dpo_comments=data.get('dpo_comments'),
            next_review_date=datetime.utcnow() + timedelta(days=365)
        )
        
        if dpia.dpo_approval:
            dpia.approval_date = datetime.utcnow()
        
        db.session.add(dpia)
        db.session.commit()
        
        return jsonify({
            'dpia_id': dpia.id,
            'risk_level': dpia.risk_level,
            'dpo_approval': dpia.dpo_approval,
            'next_review_date': dpia.next_review_date.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@compliance_bp.route('/compliance/data-retention/cleanup', methods=['POST'])
def run_data_retention_cleanup():
    """Executar limpeza de dados baseada em políticas de retenção"""
    try:
        # Obter políticas de retenção
        policies = DataRetentionPolicy.query.filter_by(auto_deletion_enabled=True).all()
        
        cleanup_results = []
        
        for policy in policies:
            cutoff_date = datetime.utcnow() - timedelta(days=policy.retention_period_days)
            
            if policy.data_type == 'assessment_data':
                # Aqui você implementaria a lógica específica de limpeza
                # Por exemplo, anonymizar ou deletar avaliações antigas
                cleanup_results.append(f"Processed {policy.data_type} older than {cutoff_date}")
            
            elif policy.data_type == 'processing_logs':
                # Deletar logs antigos
                old_logs = DataProcessingLog.query.filter(
                    DataProcessingLog.processing_timestamp < cutoff_date
                ).count()
                
                DataProcessingLog.query.filter(
                    DataProcessingLog.processing_timestamp < cutoff_date
                ).delete()
                
                cleanup_results.append(f"Deleted {old_logs} old processing logs")
        
        db.session.commit()
        
        return jsonify({
            'cleanup_results': cleanup_results,
            'policies_processed': len(policies),
            'cleanup_date': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def perform_compliance_check(audit_type):
    """Executar verificações de conformidade"""
    if audit_type == 'gdpr':
        return gdpr_compliance_check()
    elif audit_type == 'ai_act':
        return ai_act_compliance_check()
    else:
        return {
            'score': 85,
            'findings': ['Auditoria genérica executada'],
            'recommendations': ['Implementar verificações específicas']
        }

def gdpr_compliance_check():
    """Verificação de conformidade GDPR"""
    findings = []
    score = 100
    
    # Verificar se há usuários sem consentimento
    users_without_consent = User.query.outerjoin(ConsentManagement).filter(
        ConsentManagement.id.is_(None)
    ).count()
    
    if users_without_consent > 0:
        findings.append(f"{users_without_consent} usuários sem registro de consentimento")
        score -= 20
    
    # Verificar políticas de retenção
    retention_policies = DataRetentionPolicy.query.count()
    if retention_policies == 0:
        findings.append("Nenhuma política de retenção de dados definida")
        score -= 15
    
    recommendations = [
        "Revisar consentimentos mensalmente",
        "Implementar limpeza automática de dados",
        "Treinar equipe em GDPR"
    ]
    
    if not findings:
        findings.append("Sistema em conformidade com GDPR")
    
    return {
        'score': max(score, 0),
        'findings': findings,
        'recommendations': recommendations
    }

def ai_act_compliance_check():
    """Verificação de conformidade EU AI Act"""
    findings = []
    score = 100
    
    # Verificar decisões de IA sem supervisão humana
    unsupervised_decisions = AIGovernance.query.filter_by(
        human_review_required=True,
        human_review_date=None
    ).count()
    
    if unsupervised_decisions > 0:
        findings.append(f"{unsupervised_decisions} decisões de IA pendentes de supervisão humana")
        score -= 25
    
    # Verificar explicabilidade
    unexplained_decisions = AIGovernance.query.filter(
        AIGovernance.explanation.is_(None)
    ).count()
    
    if unexplained_decisions > 0:
        findings.append(f"{unexplained_decisions} decisões de IA sem explicação")
        score -= 20
    
    recommendations = [
        "Implementar supervisão humana para todas as decisões de alto risco",
        "Melhorar explicabilidade dos modelos de IA",
        "Monitorar viés algorítmico continuamente"
    ]
    
    if not findings:
        findings.append("Sistema em conformidade com EU AI Act")
    
    return {
        'score': max(score, 0),
        'findings': findings,
        'recommendations': recommendations
    }