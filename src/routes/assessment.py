from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.assessment import DiscAssessment, MentalHealthAssessment, PersonalizedInsight
from src.models.compliance import ConsentManagement, ProfessionalOversight, AIGovernance
from datetime import datetime
import json
import hashlib

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/assessments/disc', methods=['POST'])
def create_disc_assessment():
    """Criar nova avaliação DISC"""
    try:
        data = request.get_json()
        user_id = data['user_id']
        
        # Verificar consentimento
        consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        if not consent or not consent.disc_assessment:
            return jsonify({'error': 'Consentimento para avaliação DISC não foi dado'}), 403
        
        # Criar avaliação DISC
        assessment = DiscAssessment(
            user_id=user_id,
            dominance_score=data['dominance_score'],
            influence_score=data['influence_score'],
            steadiness_score=data['steadiness_score'],
            conscientiousness_score=data['conscientiousness_score'],
            primary_style=data['primary_style'],
            secondary_style=data.get('secondary_style')
        )
        
        db.session.add(assessment)
        db.session.flush()
        
        # Criar insights personalizados baseados no perfil DISC
        insights = generate_disc_insights(assessment)
        for insight_data in insights:
            insight = PersonalizedInsight(
                user_id=user_id,
                category=insight_data['category'],
                title=insight_data['title'],
                content=insight_data['content'],
                priority=insight_data['priority']
            )
            db.session.add(insight)
        
        db.session.commit()
        
        return jsonify({
            'assessment': assessment.to_dict(),
            'insights_generated': len(insights),
            'message': 'Avaliação DISC criada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assessment_bp.route('/assessments/mental-health', methods=['POST'])
def create_mental_health_assessment():
    """Criar nova avaliação de saúde mental"""
    try:
        data = request.get_json()
        user_id = data['user_id']
        
        # Verificar consentimento
        consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        if not consent or not consent.mental_health_screening:
            return jsonify({'error': 'Consentimento para avaliação de saúde mental não foi dado'}), 403
        
        # Criar avaliação de saúde mental
        assessment = MentalHealthAssessment(
            user_id=user_id,
            phq9_score=data.get('phq9_score'),
            phq9_severity=data.get('phq9_severity'),
            gad7_score=data.get('gad7_score'),
            gad7_severity=data.get('gad7_severity'),
            burnout_score=data.get('burnout_score'),
            burnout_risk=data.get('burnout_risk'),
            wellness_score=data.get('wellness_score')
        )
        
        db.session.add(assessment)
        db.session.flush()
        
        # Verificar se supervisão profissional é necessária
        requires_oversight = check_professional_oversight_required(assessment)
        
        if requires_oversight:
            # Aqui você criaria um ProfessionalOversight record
            # Por simplicidade, apenas logamos
            print(f"Professional oversight required for user {user_id}, assessment {assessment.id}")
        
        # Registrar decisão de IA (EU AI Act compliance)
        ai_decision = AIGovernance(
            user_id=user_id,
            model_version='mental_health_v1.0',
            input_data_hash=generate_data_hash(data),
            prediction_result=json.dumps({
                'wellness_assessment': assessment.wellness_score,
                'risk_level': assessment.burnout_risk,
                'intervention_recommended': requires_oversight
            }),
            confidence_score=0.85,
            explanation=f'Avaliação baseada em PHQ-9: {assessment.phq9_score}, GAD-7: {assessment.gad7_score}, Burnout: {assessment.burnout_score}',
            human_review_required=requires_oversight,
            risk_assessment='limited'
        )
        
        db.session.add(ai_decision)
        db.session.commit()
        
        return jsonify({
            'assessment': assessment.to_dict(),
            'requires_professional_oversight': requires_oversight,
            'ai_governance_logged': True,
            'message': 'Avaliação de saúde mental criada com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@assessment_bp.route('/users/<int:user_id>/assessments', methods=['GET'])
def get_user_assessments(user_id):
    """Obter todas as avaliações de um usuário"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Verificar se o usuário tem consentimento para acesso aos dados
        consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        if not consent:
            return jsonify({'error': 'Consentimento não encontrado'}), 404
        
        assessments_data = {
            'user_id': user_id,
            'disc_assessments': [assessment.to_dict() for assessment in user.disc_assessments],
            'mental_health_assessments': [assessment.to_dict() for assessment in user.mental_health_assessments],
            'personalized_insights': [insight.to_dict() for insight in user.personalized_insights],
            'total_assessments': len(user.disc_assessments) + len(user.mental_health_assessments)
        }
        
        return jsonify(assessments_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@assessment_bp.route('/insights/<int:insight_id>/read', methods=['PUT'])
def mark_insight_as_read(insight_id):
    """Marcar insight como lido"""
    try:
        insight = PersonalizedInsight.query.get_or_404(insight_id)
        
        insight.is_read = True
        insight.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'insight': insight.to_dict(),
            'message': 'Insight marcado como lido'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

def generate_disc_insights(assessment):
    """Gerar insights personalizados baseados no perfil DISC"""
    insights = []
    
    primary = assessment.primary_style
    
    if primary == 'D':
        insights.append({
            'category': 'productivity',
            'title': 'Estratégias para Perfil Dominante',
            'content': 'Como pessoa com perfil Dominante, você tende a ser orientado para resultados. Foque em metas claras e prazos definidos para maximizar sua produtividade.',
            'priority': 'high'
        })
    elif primary == 'I':
        insights.append({
            'category': 'communication',
            'title': 'Maximizando seu Perfil Influente',
            'content': 'Seu perfil Influente é ideal para networking e apresentações. Use sua natureza comunicativa para liderar projetos colaborativos.',
            'priority': 'medium'
        })
    elif primary == 'S':
        insights.append({
            'category': 'wellness',
            'title': 'Estabilidade e Bem-estar',
            'content': 'Como pessoa com perfil Estável, você valoriza harmonia. Mantenha rotinas consistentes e ambientes de trabalho colaborativos.',
            'priority': 'medium'
        })
    elif primary == 'C':
        insights.append({
            'category': 'productivity',
            'title': 'Aproveitando seu Perfil Consciencioso',
            'content': 'Seu perfil Consciencioso busca qualidade e precisão. Estabeleça processos claros e reserve tempo adequado para análise detalhada.',
            'priority': 'high'
        })
    
    return insights

def check_professional_oversight_required(assessment):
    """Verificar se supervisão profissional é necessária"""
    # Critérios para supervisão profissional
    if assessment.phq9_score and assessment.phq9_score >= 15:  # Moderadamente severo
        return True
    if assessment.gad7_score and assessment.gad7_score >= 15:  # Ansiedade severa
        return True
    if assessment.burnout_score and assessment.burnout_score >= 70:  # Burnout alto
        return True
    
    return False

def generate_data_hash(data):
    """Gerar hash dos dados de entrada para trilha de auditoria"""
    data_string = json.dumps(data, sort_keys=True)
    return hashlib.sha256(data_string.encode()).hexdigest()