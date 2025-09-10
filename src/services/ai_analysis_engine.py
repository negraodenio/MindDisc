"""
AI Analysis Engine - Sistema de Cruzamento DISC x Saúde Mental
Mind-Bridge European Compliance Edition

Este engine combina algoritmos científicos validados com análise de IA avançada
para gerar insights personalizados baseados em correlações DISC x Saúde Mental.
"""

import openai
import json
import time
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
import math
import os

from src.models.user import db
from src.models.assessment import DiscAssessment, MentalHealthAssessment
from src.models.ai_analysis import AIAnalysis, AIAnalysisStatistics
from src.models.compliance import ProfessionalOversight, AIGovernance

class AIAnalysisEngine:
    """Engine principal para análise de correlações DISC x Saúde Mental com IA"""
    
    def __init__(self):
        # Configuração OpenAI
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        self.openai_model = os.getenv('OPENAI_MODEL', 'gpt-4')
        self.openai_temperature = float(os.getenv('OPENAI_TEMPERATURE', '0.3'))
        self.openai_max_tokens = int(os.getenv('OPENAI_MAX_TOKENS', '2000'))
        
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        # Configurações do sistema
        self.model_version = "v2.0.0-eu-compliant"
        self.confidence_threshold = 0.7  # Mínimo para não requerer supervisão
        
        # Multiplicadores de risco baseados em pesquisa
        self.risk_multipliers = AIAnalysis.get_risk_multipliers()
    
    def analyze_correlation(self, user_id: int, disc_results: Dict, mental_health_results: Dict, 
                          user_context: Optional[Dict] = None) -> Dict:
        """
        Executar análise completa de correlação DISC x Saúde Mental
        
        Args:
            user_id: ID do usuário
            disc_results: Resultados da avaliação DISC
            mental_health_results: Resultados de saúde mental
            user_context: Contexto adicional do usuário
            
        Returns:
            dict: Análise completa com insights e recomendações
        """
        start_time = time.time()
        
        try:
            # Gerar ID único para a análise
            analysis_id = f"ai_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
            
            # 1. Calcular score de risco base
            risk_assessment = self._calculate_risk_assessment(disc_results, mental_health_results)
            
            # 2. Análise com IA (OpenAI GPT-4)
            ai_analysis = self._perform_ai_analysis(disc_results, mental_health_results, user_context)
            
            # 3. Gerar recomendações personalizadas
            recommendations = self._generate_personalized_recommendations(
                disc_results, mental_health_results, risk_assessment, ai_analysis
            )
            
            # 4. Determinar necessidade de supervisão profissional
            professional_oversight_required = self._requires_professional_oversight(
                risk_assessment, mental_health_results
            )
            
            # 5. Calcular confiança da análise
            confidence_score = self._calculate_confidence_score(
                disc_results, mental_health_results, ai_analysis
            )
            
            processing_time = int((time.time() - start_time) * 1000)
            
            # 6. Salvar análise no banco de dados
            analysis = AIAnalysis(
                analysis_id=analysis_id,
                user_id=user_id,
                disc_data=json.dumps(disc_results),
                mental_health_data=json.dumps(mental_health_results),
                user_context=json.dumps(user_context or {}),
                overall_risk_score=risk_assessment['overall_risk_score'],
                risk_level=risk_assessment['risk_level'],
                confidence_score=confidence_score,
                correlation_analysis=json.dumps(ai_analysis),
                risk_factors=json.dumps(risk_assessment.get('risk_factors', [])),
                protective_factors=json.dumps(risk_assessment.get('protective_factors', [])),
                personalized_recommendations=json.dumps(recommendations),
                intervention_priority=self._determine_intervention_priority(risk_assessment),
                professional_oversight_required=professional_oversight_required,
                ai_model_version=self.model_version,
                openai_model_used=self.openai_model,
                processing_time_ms=processing_time,
                expires_at=datetime.utcnow() + timedelta(days=365)  # GDPR compliance
            )
            
            db.session.add(analysis)
            
            # 7. Criar registro de supervisão profissional se necessário
            if professional_oversight_required:
                self._create_professional_oversight_record(user_id, analysis_id, risk_assessment)
            
            # 8. Registrar decisão de IA (EU AI Act compliance)
            self._log_ai_governance(user_id, analysis_id, risk_assessment, confidence_score)
            
            db.session.commit()
            
            return {
                'success': True,
                'analysis_id': analysis_id,
                'result': {
                    'disc_profile': disc_results.get('primary_style', 'Unknown'),
                    'risk_assessment': risk_assessment,
                    'overall_risk_score': risk_assessment['overall_risk_score'],
                    'risk_level': risk_assessment['risk_level'],
                    'professional_oversight_required': professional_oversight_required,
                    'confidence_score': confidence_score,
                    'correlation_analysis': ai_analysis,
                    'personalized_recommendations': recommendations,
                    'intervention_priority': self._determine_intervention_priority(risk_assessment),
                    'follow_up_schedule': self._generate_follow_up_schedule(risk_assessment),
                    'processing_time_ms': processing_time
                }
            }
            
        except Exception as e:
            db.session.rollback()
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro durante análise de correlação'
            }
    
    def _calculate_risk_assessment(self, disc_results: Dict, mental_health_results: Dict) -> Dict:
        """Calcular avaliação de risco baseada em algoritmos científicos"""
        
        primary_style = disc_results.get('primary_style', 'D')
        multipliers = self.risk_multipliers.get(primary_style, self.risk_multipliers['D'])
        
        # Scores base normalizados (0-100)
        phq9_score = mental_health_results.get('phq9_score', 0)
        gad7_score = mental_health_results.get('gad7_score', 0) 
        burnout_score = mental_health_results.get('burnout_score', 0)
        
        # Normalizar scores para 0-100
        phq9_normalized = min((phq9_score / 27) * 100, 100)  # PHQ-9 max = 27
        gad7_normalized = min((gad7_score / 21) * 100, 100)  # GAD-7 max = 21
        burnout_normalized = min(burnout_score, 100)  # Já normalizado
        
        # Aplicar multiplicadores DISC
        adjusted_depression = phq9_normalized * multipliers['depression']
        adjusted_anxiety = gad7_normalized * multipliers['anxiety']
        adjusted_burnout = burnout_normalized * multipliers['burnout']
        
        # Calcular score geral ponderado
        weights = {'depression': 0.3, 'anxiety': 0.3, 'burnout': 0.4}
        overall_risk_score = (
            adjusted_depression * weights['depression'] +
            adjusted_anxiety * weights['anxiety'] +
            adjusted_burnout * weights['burnout']
        )
        
        # Determinar nível de risco
        if overall_risk_score <= 25:
            risk_level = 'low'
        elif overall_risk_score <= 50:
            risk_level = 'moderate'
        elif overall_risk_score <= 75:
            risk_level = 'high'
        else:
            risk_level = 'critical'
        
        # Identificar fatores de risco e proteção
        risk_factors = self._identify_risk_factors(disc_results, mental_health_results)
        protective_factors = self._identify_protective_factors(disc_results)
        
        return {
            'overall_risk_score': round(overall_risk_score, 1),
            'risk_level': risk_level,
            'individual_risks': {
                'depression_risk': round(adjusted_depression, 1),
                'anxiety_risk': round(adjusted_anxiety, 1),
                'burnout_risk': round(adjusted_burnout, 1)
            },
            'risk_factors': risk_factors,
            'protective_factors': protective_factors,
            'disc_multipliers_applied': multipliers,
            'algorithm_version': self.model_version,
            'confidence_interval': {
                'lower_bound': max(0, overall_risk_score - 10),
                'upper_bound': min(100, overall_risk_score + 10),
                'confidence_level': 0.85
            }
        }
    
    def _perform_ai_analysis(self, disc_results: Dict, mental_health_results: Dict, 
                           user_context: Optional[Dict]) -> Dict:
        """Executar análise com OpenAI GPT-4"""
        
        if not self.openai_api_key:
            return {
                'correlation_summary': 'Análise de IA não disponível - chave OpenAI não configurada',
                'key_insights': ['Configure OPENAI_API_KEY para análise avançada'],
                'ai_recommendations': []
            }
        
        try:
            # Construir prompt estruturado
            prompt = self._build_ai_prompt(disc_results, mental_health_results, user_context)
            
            # Chamar OpenAI API
            response = openai.ChatCompletion.create(
                model=self.openai_model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Você é um especialista em psicologia organizacional e análise comportamental, especializado em correlações entre perfis DISC e indicadores de saúde mental. Forneça análises baseadas em evidências científicas."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=self.openai_temperature,
                max_tokens=self.openai_max_tokens,
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            
            ai_content = response.choices[0].message.content
            
            # Parsing estruturado da resposta
            return self._parse_ai_response(ai_content)
            
        except Exception as e:
            return {
                'correlation_summary': f'Erro na análise de IA: {str(e)}',
                'key_insights': ['Análise manual baseada em algoritmos científicos'],
                'ai_recommendations': []
            }
    
    def _build_ai_prompt(self, disc_results: Dict, mental_health_results: Dict, 
                        user_context: Optional[Dict]) -> str:
        """Construir prompt estruturado para OpenAI"""
        
        prompt = f"""
Analise as correlações entre o perfil DISC e os indicadores de saúde mental do seguinte indivíduo:

PERFIL DISC:
- Estilo Primário: {disc_results.get('primary_style', 'N/A')}
- Estilo Secundário: {disc_results.get('secondary_style', 'N/A')}
- Scores: D={disc_results.get('scores', {}).get('D', 0)}, I={disc_results.get('scores', {}).get('I', 0)}, S={disc_results.get('scores', {}).get('S', 0)}, C={disc_results.get('scores', {}).get('C', 0)}
- Intensidade: {disc_results.get('intensity', 'N/A')}
- Flexibilidade: {disc_results.get('flexibility_score', 'N/A')}

INDICADORES DE SAÚDE MENTAL:
- PHQ-9 (Depressão): {mental_health_results.get('phq9_score', 0)}/27 - {mental_health_results.get('phq9_severity', 'N/A')}
- GAD-7 (Ansiedade): {mental_health_results.get('gad7_score', 0)}/21 - {mental_health_results.get('gad7_severity', 'N/A')}
- Burnout: {mental_health_results.get('burnout_score', 0)}/100 - Risco {mental_health_results.get('burnout_risk', 'N/A')}
- Wellness Score: {mental_health_results.get('wellness_score', 0)}/100

CONTEXTO PROFISSIONAL:
{json.dumps(user_context or {}, indent=2)}

Com base na literatura científica sobre correlações DISC-saúde mental, forneça uma análise estruturada:

1. RESUMO DA CORRELAÇÃO (2-3 frases)
2. INSIGHTS PRINCIPAIS (3-5 pontos)
3. FATORES DE RISCO ESPECÍFICOS (relacionados ao perfil DISC)
4. FATORES DE PROTEÇÃO (pontos fortes do perfil)
5. RECOMENDAÇÕES BASEADAS EM EVIDÊNCIAS (3-4 intervenções específicas)

Mantenha a análise científica, objetiva e focada em ações práticas.
"""
        
        return prompt
    
    def _parse_ai_response(self, ai_content: str) -> Dict:
        """Fazer parsing estruturado da resposta da IA"""
        
        # Parsing simples - em produção, seria mais sofisticado
        lines = ai_content.split('\n')
        
        correlation_summary = ""
        key_insights = []
        ai_recommendations = []
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "RESUMO" in line.upper() or "CORRELAÇÃO" in line.upper():
                current_section = "summary"
            elif "INSIGHTS" in line.upper() or "PRINCIPAIS" in line.upper():
                current_section = "insights"
            elif "RECOMENDAÇÕES" in line.upper() or "EVIDÊNCIAS" in line.upper():
                current_section = "recommendations"
            elif line.startswith(('-', '•', '*')) or line[0].isdigit():
                if current_section == "insights":
                    key_insights.append(line.lstrip('-•*0123456789. '))
                elif current_section == "recommendations":
                    ai_recommendations.append(line.lstrip('-•*0123456789. '))
            elif current_section == "summary" and len(line) > 20:
                correlation_summary += line + " "
        
        return {
            'correlation_summary': correlation_summary.strip(),
            'key_insights': key_insights[:5],  # Limitar a 5
            'ai_recommendations': ai_recommendations[:4],  # Limitar a 4
            'analysis_quality': 'high' if len(key_insights) >= 3 else 'medium'
        }
    
    def _generate_personalized_recommendations(self, disc_results: Dict, mental_health_results: Dict,
                                             risk_assessment: Dict, ai_analysis: Dict) -> List[Dict]:
        """Gerar recomendações personalizadas baseadas no perfil e riscos"""
        
        recommendations = []
        primary_style = disc_results.get('primary_style', 'D')
        risk_level = risk_assessment['risk_level']
        
        # Recomendações baseadas no perfil DISC
        disc_recommendations = self._get_disc_specific_recommendations(primary_style, risk_level)
        recommendations.extend(disc_recommendations)
        
        # Recomendações baseadas em riscos específicos
        if risk_assessment['individual_risks']['burnout_risk'] > 60:
            recommendations.append({
                'category': 'Gestão de Burnout',
                'title': 'Programa de Prevenção de Burnout',
                'description': 'Implementar estratégias específicas para reduzir exaustão emocional',
                'priority': 'high',
                'evidence_level': 'strong',
                'implementation_time': '2-4 semanas'
            })
        
        if risk_assessment['individual_risks']['anxiety_risk'] > 70:
            recommendations.append({
                'category': 'Gestão de Ansiedade',
                'title': 'Técnicas de Regulação Emocional',
                'description': 'Mindfulness e técnicas de respiração para controle da ansiedade',
                'priority': 'high',
                'evidence_level': 'strong',
                'implementation_time': '1-2 semanas'
            })
        
        # Incorporar recomendações da IA
        for ai_rec in ai_analysis.get('ai_recommendations', []):
            recommendations.append({
                'category': 'IA Personalizada',
                'title': 'Insight Baseado em IA',
                'description': ai_rec,
                'priority': 'medium',
                'evidence_level': 'ai_generated',
                'implementation_time': 'variável'
            })
        
        # Limitar e priorizar
        return sorted(recommendations, key=lambda x: {'high': 3, 'medium': 2, 'low': 1}[x['priority']], reverse=True)[:6]
    
    def _get_disc_specific_recommendations(self, style: str, risk_level: str) -> List[Dict]:
        """Recomendações específicas por perfil DISC"""
        
        base_recommendations = {
            'D': [
                {
                    'category': 'Liderança',
                    'title': 'Técnicas de Delegação Eficaz',
                    'description': 'Aprenda a delegar tarefas para reduzir sobrecarga',
                    'priority': 'high',
                    'evidence_level': 'strong',
                    'implementation_time': '2-4 semanas'
                }
            ],
            'I': [
                {
                    'category': 'Relacionamentos',
                    'title': 'Desenvolvimento de Autovalidação',
                    'description': 'Reduzir dependência de aprovação externa',
                    'priority': 'high',
                    'evidence_level': 'strong',
                    'implementation_time': '4-8 semanas'
                }
            ],
            'S': [
                {
                    'category': 'Adaptação',
                    'title': 'Gestão de Mudanças Graduais',
                    'description': 'Estratégias para lidar melhor com transições',
                    'priority': 'medium',
                    'evidence_level': 'moderate',
                    'implementation_time': '3-6 semanas'
                }
            ],
            'C': [
                {
                    'category': 'Perfeccionismo',
                    'title': 'Redução de Autocrítica',
                    'description': 'Técnicas cognitivas para padrões mais realistas',
                    'priority': 'high',
                    'evidence_level': 'strong',
                    'implementation_time': '6-12 semanas'
                }
            ]
        }
        
        recommendations = base_recommendations.get(style, [])
        
        # Ajustar prioridade baseada no risco
        if risk_level in ['high', 'critical']:
            for rec in recommendations:
                if rec['priority'] == 'medium':
                    rec['priority'] = 'high'
        
        return recommendations
    
    def _identify_risk_factors(self, disc_results: Dict, mental_health_results: Dict) -> List[str]:
        """Identificar fatores de risco específicos"""
        
        risk_factors = []
        primary_style = disc_results.get('primary_style', 'D')
        
        # Fatores baseados no perfil DISC
        disc_risk_factors = {
            'D': ['Sobrecarga de responsabilidades', 'Impaciência com processos', 'Isolamento na liderança'],
            'I': ['Dependência de aprovação social', 'Esgotamento emocional', 'Superficialidade nas relações'],
            'S': ['Resistência a mudanças', 'Evitação de conflitos', 'Sobrecarga silenciosa'],
            'C': ['Perfeccionismo paralisante', 'Autocrítica excessiva', 'Rigidez comportamental']
        }
        
        risk_factors.extend(disc_risk_factors.get(primary_style, []))
        
        # Fatores baseados nos scores de saúde mental
        if mental_health_results.get('phq9_score', 0) > 14:
            risk_factors.append('Sintomas depressivos significativos')
        
        if mental_health_results.get('gad7_score', 0) > 14:
            risk_factors.append('Ansiedade severa')
        
        if mental_health_results.get('burnout_score', 0) > 70:
            risk_factors.append('Alto risco de burnout')
        
        return risk_factors
    
    def _identify_protective_factors(self, disc_results: Dict) -> List[str]:
        """Identificar fatores de proteção baseados no perfil DISC"""
        
        primary_style = disc_results.get('primary_style', 'D')
        
        protective_factors_map = {
            'D': ['Capacidade de liderança', 'Orientação para resultados', 'Tomada de decisão rápida'],
            'I': ['Habilidades sociais', 'Otimismo natural', 'Capacidade de inspirar outros'],
            'S': ['Estabilidade emocional', 'Confiabilidade', 'Trabalho em equipe'],
            'C': ['Análise detalhada', 'Qualidade do trabalho', 'Organização sistemática']
        }
        
        return protective_factors_map.get(primary_style, [])
    
    def _requires_professional_oversight(self, risk_assessment: Dict, mental_health_results: Dict) -> bool:
        """Determinar se supervisão profissional é necessária"""
        
        # Critérios de alto risco
        high_risk_criteria = [
            risk_assessment['overall_risk_score'] > 75,
            risk_assessment['risk_level'] in ['high', 'critical'],
            mental_health_results.get('phq9_score', 0) >= 15,  # Depressão moderada-severa
            mental_health_results.get('gad7_score', 0) >= 15,  # Ansiedade severa
            mental_health_results.get('burnout_score', 0) >= 80  # Burnout crítico
        ]
        
        return any(high_risk_criteria)
    
    def _calculate_confidence_score(self, disc_results: Dict, mental_health_results: Dict, 
                                  ai_analysis: Dict) -> float:
        """Calcular score de confiança da análise"""
        
        confidence_factors = []
        
        # Qualidade dos dados DISC
        disc_scores = disc_results.get('scores', {})
        if all(isinstance(score, (int, float)) for score in disc_scores.values()):
            confidence_factors.append(0.9)
        else:
            confidence_factors.append(0.6)
        
        # Qualidade dos dados de saúde mental
        mental_scores = [
            mental_health_results.get('phq9_score'),
            mental_health_results.get('gad7_score'),
            mental_health_results.get('burnout_score')
        ]
        complete_mental_data = sum(1 for score in mental_scores if score is not None)
        confidence_factors.append(complete_mental_data / 3 * 0.8 + 0.2)
        
        # Qualidade da análise de IA
        ai_quality = ai_analysis.get('analysis_quality', 'medium')
        quality_scores = {'high': 0.95, 'medium': 0.8, 'low': 0.6}
        confidence_factors.append(quality_scores.get(ai_quality, 0.7))
        
        # Média ponderada
        return round(sum(confidence_factors) / len(confidence_factors) * 100, 1)
    
    def _determine_intervention_priority(self, risk_assessment: Dict) -> str:
        """Determinar prioridade de intervenção"""
        
        risk_level = risk_assessment['risk_level']
        overall_score = risk_assessment['overall_risk_score']
        
        if risk_level == 'critical' or overall_score > 80:
            return 'urgent'
        elif risk_level == 'high' or overall_score > 60:
            return 'high'
        elif risk_level == 'moderate' or overall_score > 30:
            return 'medium'
        else:
            return 'low'
    
    def _generate_follow_up_schedule(self, risk_assessment: Dict) -> Dict:
        """Gerar cronograma de acompanhamento"""
        
        risk_level = risk_assessment['risk_level']
        
        schedules = {
            'critical': {'frequency': 'semanal', 'duration_weeks': 12},
            'high': {'frequency': 'quinzenal', 'duration_weeks': 8},
            'moderate': {'frequency': 'mensal', 'duration_weeks': 6},
            'low': {'frequency': 'trimestral', 'duration_weeks': 12}
        }
        
        return schedules.get(risk_level, schedules['moderate'])
    
    def _create_professional_oversight_record(self, user_id: int, analysis_id: str, 
                                            risk_assessment: Dict):
        """Criar registro de supervisão profissional"""
        
        oversight = ProfessionalOversight(
            user_id=user_id,
            case_type='ai_analysis_high_risk',
            risk_level=risk_assessment['risk_level'],
            case_description=f'Análise AI {analysis_id} indicou alto risco: {risk_assessment["overall_risk_score"]:.1f}/100',
            assigned_professional_id=None,  # Será atribuído posteriormente
            status='pending_assignment',
            priority='high' if risk_assessment['risk_level'] in ['high', 'critical'] else 'medium',
            created_at=datetime.utcnow()
        )
        
        db.session.add(oversight)
    
    def _log_ai_governance(self, user_id: int, analysis_id: str, risk_assessment: Dict, 
                          confidence_score: float):
        """Registrar decisão de IA para compliance EU AI Act"""
        
        ai_governance = AIGovernance(
            user_id=user_id,
            model_version=f'{self.model_version}_correlation_analysis',
            input_data_hash=f'analysis_{analysis_id}',
            prediction_result=json.dumps({
                'overall_risk_score': risk_assessment['overall_risk_score'],
                'risk_level': risk_assessment['risk_level'],
                'requires_oversight': risk_assessment['overall_risk_score'] > 75
            }),
            confidence_score=confidence_score / 100,
            explanation=f'Análise de correlação DISC-Saúde Mental usando algoritmos científicos e IA. Score de risco: {risk_assessment["overall_risk_score"]:.1f}/100',
            human_review_required=risk_assessment['overall_risk_score'] > 75,
            risk_assessment='limited',  # Classificação EU AI Act
            automated_decision_made=True,
            decision_type='health_risk_assessment'
        )
        
        db.session.add(ai_governance)


# Instância global do engine
ai_engine = AIAnalysisEngine()