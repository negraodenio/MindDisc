"""
APIs de Análise Comportamental Organizacional
Mind-Bridge European Compliance Edition

DIFERENCIAL SEGURO: Mantém valor competitivo sem riscos clínicos ou legais
"""

from flask import Blueprint, request, jsonify
from src.models.user import db, User
from src.models.behavioral_patterns import behavioral_analyzer
from src.models.compliance import ConsentManagement
from datetime import datetime
import json

behavioral_analysis_bp = Blueprint('behavioral_analysis', __name__)

@behavioral_analysis_bp.route('/behavioral-analysis/patterns', methods=['POST'])
def analyze_behavioral_patterns():
    """
    Analisar padrões comportamentais organizacionais (não clínicos)
    
    POST /api/v1/behavioral-analysis/patterns
    
    Payload:
    {
        "user_id": 1,
        "disc_scores": {"D": 85, "I": 30, "S": 15, "C": 60}
    }
    """
    try:
        data = request.get_json()
        
        # Validação
        if 'disc_scores' not in data:
            return jsonify({
                'success': False,
                'error': 'disc_scores obrigatório'
            }), 400
        
        disc_scores = data['disc_scores']
        user_id = data.get('user_id')
        
        # Verificar consentimentos se usuário especificado
        if user_id:
            user = User.query.get(user_id)
            if not user:
                return jsonify({
                    'success': False,
                    'error': 'Usuário não encontrado'
                }), 404
            
            consent = ConsentManagement.query.filter_by(user_id=user_id).first()
            if not consent or not consent.disc_assessment:
                return jsonify({
                    'success': False,
                    'error': 'Consentimento para análise DISC necessário'
                }), 403
        
        # Executar análise comportamental
        analysis = behavioral_analyzer.analyze_behavioral_patterns(disc_scores)
        
        return jsonify({
            'success': True,
            'analysis': analysis,
            'methodology': 'Análise de padrões comportamentais organizacionais (não clínicos)',
            'disclaimer': 'Esta análise NÃO constitui diagnóstico clínico ou psicológico',
            'message': 'Análise de padrões comportamentais concluída'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro durante análise comportamental'
        }), 500


@behavioral_analysis_bp.route('/behavioral-analysis/workplace-report', methods=['POST'])
def generate_workplace_report():
    """
    Gerar relatório organizacional de padrões comportamentais
    
    POST /api/v1/behavioral-analysis/workplace-report
    """
    try:
        data = request.get_json()
        disc_scores = data.get('disc_scores', {})
        
        if not disc_scores:
            return jsonify({
                'success': False,
                'error': 'disc_scores obrigatório'
            }), 400
        
        # Executar análise
        analysis = behavioral_analyzer.analyze_behavioral_patterns(disc_scores)
        
        # Gerar relatório
        report = behavioral_analyzer.generate_workplace_report(disc_scores, analysis)
        
        return jsonify({
            'success': True,
            'report': report,
            'analysis_summary': {
                'patterns_identified': len(analysis['identified_patterns']),
                'risk_combinations': len(analysis['risk_combinations']),
                'overall_risk_score': analysis['overall_risk_score'],
                'requires_management_support': analysis['requires_management_support']
            },
            'generated_at': datetime.utcnow().isoformat(),
            'message': 'Relatório organizacional gerado com sucesso'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao gerar relatório organizacional'
        }), 500


@behavioral_analysis_bp.route('/behavioral-analysis/risk-assessment', methods=['POST'])
def assess_psychosocial_risks():
    """
    Avaliar riscos psicossociais organizacionais
    
    POST /api/v1/behavioral-analysis/risk-assessment
    """
    try:
        data = request.get_json()
        disc_scores = data.get('disc_scores', {})
        context = data.get('work_context', {})
        
        # Executar análise
        analysis = behavioral_analyzer.analyze_behavioral_patterns(disc_scores)
        
        # Calcular riscos psicossociais específicos
        psychosocial_risks = {
            'burnout_risk': 'low',
            'isolation_risk': 'low',
            'anxiety_risk': 'low',
            'stress_vulnerability': 'moderate'
        }
        
        # Ajustar baseado em combinações de risco
        for risk_combo in analysis['risk_combinations']:
            risk_type = risk_combo['risk_type'].lower().replace(' ', '_')
            if 'burnout' in risk_type:
                psychosocial_risks['burnout_risk'] = 'high'
            elif 'isolation' in risk_type:
                psychosocial_risks['isolation_risk'] = 'high'
            elif 'anxiety' in risk_type:
                psychosocial_risks['anxiety_risk'] = 'high'
        
        # Recomendações preventivas
        preventive_actions = []
        if analysis['overall_risk_score'] > 60:
            preventive_actions.extend([
                'Implementar check-ins regulares com gestão',
                'Considerar ajustes na carga de trabalho',
                'Disponibilizar recursos de bem-estar corporativo'
            ])
        
        if analysis['requires_management_support']:
            preventive_actions.append('Ativar suporte gerencial especializado')
        
        return jsonify({
            'success': True,
            'psychosocial_risks': psychosocial_risks,
            'overall_risk_score': analysis['overall_risk_score'],
            'preventive_actions': preventive_actions,
            'intervention_urgency': 'high' if analysis['overall_risk_score'] > 70 else 'moderate',
            'context_considered': bool(context),
            'assessment_date': datetime.utcnow().isoformat(),
            'message': 'Avaliação de riscos psicossociais concluída'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na avaliação de riscos psicossociais'
        }), 500


@behavioral_analysis_bp.route('/behavioral-analysis/team-compatibility', methods=['POST'])
def analyze_team_compatibility():
    """
    Analisar compatibilidade de padrões comportamentais em equipe
    
    POST /api/v1/behavioral-analysis/team-compatibility
    
    Payload:
    {
        "team_members": [
            {"name": "João", "disc_scores": {"D": 85, "I": 30, "S": 15, "C": 60}},
            {"name": "Maria", "disc_scores": {"D": 20, "I": 80, "S": 70, "C": 30}}
        ]
    }
    """
    try:
        data = request.get_json()
        team_members = data.get('team_members', [])
        
        if len(team_members) < 2:
            return jsonify({
                'success': False,
                'error': 'Mínimo de 2 membros necessário para análise de equipe'
            }), 400
        
        team_analysis = {
            'team_size': len(team_members),
            'behavioral_diversity': {},
            'potential_conflicts': [],
            'collaboration_strengths': [],
            'team_dynamics': '',
            'management_recommendations': []
        }
        
        # Analisar diversidade comportamental
        all_patterns = []
        for member in team_members:
            member_analysis = behavioral_analyzer.analyze_behavioral_patterns(
                member['disc_scores']
            )
            all_patterns.extend([p['pattern'] for p in member_analysis['identified_patterns']])
        
        # Calcular diversidade
        unique_patterns = set(all_patterns)
        team_analysis['behavioral_diversity'] = {
            'total_patterns': len(all_patterns),
            'unique_patterns': len(unique_patterns),
            'diversity_score': len(unique_patterns) / max(len(team_members), 1) * 100
        }
        
        # Identificar potenciais conflitos baseados em padrões
        high_d_count = sum(1 for m in team_members if m['disc_scores'].get('D', 0) > 70)
        high_c_count = sum(1 for m in team_members if m['disc_scores'].get('C', 0) > 70)
        
        if high_d_count > 1:
            team_analysis['potential_conflicts'].append(
                'Múltiplos perfis dominantes podem gerar conflitos de liderança'
            )
        
        if high_c_count > 2:
            team_analysis['potential_conflicts'].append(
                'Excesso de perfis perfeccionistas pode causar paralisia decisória'
            )
        
        # Identificar forças de colaboração
        high_s_count = sum(1 for m in team_members if m['disc_scores'].get('S', 0) > 70)
        high_i_count = sum(1 for m in team_members if m['disc_scores'].get('I', 0) > 70)
        
        if high_s_count >= 1:
            team_analysis['collaboration_strengths'].append(
                'Presença de perfis estáveis favorece harmonia da equipe'
            )
        
        if high_i_count >= 1:
            team_analysis['collaboration_strengths'].append(
                'Perfis influentes facilitam comunicação e motivação'
            )
        
        # Gerar dinâmica da equipe
        if team_analysis['behavioral_diversity']['diversity_score'] > 75:
            team_analysis['team_dynamics'] = 'Equipe com alta diversidade comportamental - excelente para inovação e resolução de problemas complexos'
        elif team_analysis['behavioral_diversity']['diversity_score'] > 50:
            team_analysis['team_dynamics'] = 'Equipe com boa diversidade comportamental - balanceada para maioria das tarefas'
        else:
            team_analysis['team_dynamics'] = 'Equipe com baixa diversidade comportamental - pode precisar de membros complementares'
        
        # Recomendações de gestão
        if team_analysis['potential_conflicts']:
            team_analysis['management_recommendations'].append(
                'Implementar protocolos claros de tomada de decisão'
            )
        
        if team_analysis['behavioral_diversity']['diversity_score'] < 50:
            team_analysis['management_recommendations'].append(
                'Considerar adição de perfis comportamentais complementares'
            )
        
        return jsonify({
            'success': True,
            'team_analysis': team_analysis,
            'methodology': 'Análise de compatibilidade comportamental organizacional',
            'generated_at': datetime.utcnow().isoformat(),
            'message': 'Análise de compatibilidade de equipe concluída'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na análise de compatibilidade de equipe'
        }), 500