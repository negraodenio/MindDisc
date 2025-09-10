from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.compliance import ConsentManagement
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['GET'])
def get_users():
    """Listar todos os usuários"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users],
            'total': len(users)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users', methods=['POST'])
def create_user():
    """Criar novo usuário"""
    try:
        data = request.get_json()
        
        # Verificar se usuário já existe
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Criar usuário
        user = User(
            name=data['name'],
            email=data['email'],
            company=data.get('company')
        )
        
        db.session.add(user)
        db.session.flush()  # Para obter o ID
        
        # Criar registro de consentimento padrão
        consent = ConsentManagement(
            user_id=user.id,
            consent_ip=request.remote_addr,
            consent_user_agent=request.headers.get('User-Agent', '')
        )
        
        db.session.add(consent)
        db.session.commit()
        
        return jsonify({
            'user': user.to_dict(),
            'message': 'Usuário criado com sucesso'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Obter usuário específico"""
    try:
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Atualizar usuário"""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Atualizar campos permitidos
        if 'name' in data:
            user.name = data['name']
        if 'company' in data:
            user.company = data['company']
        
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'user': user.to_dict(),
            'message': 'Usuário atualizado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Deletar usuário (GDPR Right to Erasure)"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Log da operação para conformidade
        print(f"GDPR Deletion requested for user {user_id} - {user.email}")
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'message': 'Usuário deletado com sucesso (GDPR compliance)',
            'deleted_user_id': user_id
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/consent', methods=['GET'])
def get_user_consent(user_id):
    """Obter status de consentimento do usuário"""
    try:
        consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        if not consent:
            return jsonify({'error': 'Consentimento não encontrado'}), 404
        
        return jsonify(consent.to_dict())
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/consent', methods=['PUT'])
def update_user_consent(user_id):
    """Atualizar consentimento do usuário"""
    try:
        consent = ConsentManagement.query.filter_by(user_id=user_id).first()
        if not consent:
            return jsonify({'error': 'Consentimento não encontrado'}), 404
        
        data = request.get_json()
        
        # Atualizar consentimentos
        if 'disc_assessment' in data:
            consent.disc_assessment = data['disc_assessment']
        if 'mental_health_screening' in data:
            consent.mental_health_screening = data['mental_health_screening']
        if 'predictive_analysis' in data:
            consent.predictive_analysis = data['predictive_analysis']
        if 'professional_supervision' in data:
            consent.professional_supervision = data['professional_supervision']
        if 'data_sharing_research' in data:
            consent.data_sharing_research = data['data_sharing_research']
        if 'marketing_communications' in data:
            consent.marketing_communications = data['marketing_communications']
        
        consent.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'consent': consent.to_dict(),
            'message': 'Consentimento atualizado com sucesso'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/data-export', methods=['GET'])
def export_user_data(user_id):
    """Exportar todos os dados do usuário (GDPR Right to Portability)"""
    try:
        user = User.query.get_or_404(user_id)
        
        # Coletar todos os dados do usuário
        user_data = {
            'user_info': user.to_dict(),
            'disc_assessments': [assessment.to_dict() for assessment in user.disc_assessments],
            'mental_health_assessments': [assessment.to_dict() for assessment in user.mental_health_assessments],
            'personalized_insights': [insight.to_dict() for insight in user.personalized_insights],
            'consent_history': [consent.to_dict() for consent in user.consent_management],
            'export_date': datetime.utcnow().isoformat(),
            'export_format': 'JSON',
            'gdpr_compliance': True
        }
        
        return jsonify(user_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500