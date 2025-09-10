"""
Análise de Padrões Comportamentais Organizacionais
Mind-Bridge European Compliance Edition

DIFERENCIAL SEGURO: Análise de padrões comportamentais sem diagnósticos clínicos
Mantém valor competitivo com conformidade ética e legal total.
"""

from typing import Dict, List, Optional
import json
from datetime import datetime

class BehavioralPatternAnalyzer:
    """
    Analisador de padrões comportamentais organizacionais
    
    IMPORTANTE: Este sistema NÃO faz diagnósticos clínicos ou sugere transtornos.
    Foca em padrões comportamentais relevantes para o ambiente de trabalho.
    """
    
    def __init__(self):
        # Padrões comportamentais organizacionais (não clínicos)
        self.behavioral_patterns = {
            "high_control_pattern": {
                "disc_indicators": {"D": {"min": 75, "weight": 0.8}, "S": {"max": 30, "weight": 0.6}},
                "description": "Tendência a alta necessidade de controle em ambiente de trabalho",
                "workplace_impacts": [
                    "Dificuldade em delegação",
                    "Impaciência com processos longos",
                    "Tendência ao microgerenciamento"
                ],
                "recommendations": [
                    "Treinamento em delegação eficaz",
                    "Técnicas de gestão colaborativa",
                    "Desenvolvimento de paciência processual"
                ]
            },
            "social_avoidance_pattern": {
                "disc_indicators": {"C": {"min": 70, "weight": 0.7}, "I": {"max": 25, "weight": 0.8}},
                "description": "Tendência à evitação social em contextos profissionais",
                "workplace_impacts": [
                    "Preferência por trabalho individual",
                    "Desconforto em apresentações públicas",
                    "Comunicação limitada com equipe"
                ],
                "recommendations": [
                    "Treinamento gradual de habilidades sociais",
                    "Mentoring em comunicação",
                    "Oportunidades estruturadas de interação"
                ]
            },
            "dependency_pattern": {
                "disc_indicators": {"S": {"min": 80, "weight": 0.9}, "D": {"max": 20, "weight": 0.7}},
                "description": "Tendência à dependência de orientação externa",
                "workplace_impacts": [
                    "Evitação de tomada de decisão independente",
                    "Necessidade frequente de validação",
                    "Ansiedade quando sem supervisão direta"
                ],
                "recommendations": [
                    "Desenvolvimento gradual de autonomia",
                    "Treinamento em tomada de decisão",
                    "Sistema de feedback estruturado"
                ]
            },
            "perfectionism_pattern": {
                "disc_indicators": {"C": {"min": 85, "weight": 0.9}},
                "description": "Tendência ao perfeccionismo que pode impactar produtividade",
                "workplace_impacts": [
                    "Demora excessiva em entregas",
                    "Dificuldade em priorização",
                    "Estresse por padrões impossíveis"
                ],
                "recommendations": [
                    "Treinamento em gestão de tempo",
                    "Técnicas de priorização",
                    "Definição de padrões realistas"
                ]
            },
            "attention_seeking_pattern": {
                "disc_indicators": {"I": {"min": 85, "weight": 0.8}, "C": {"max": 25, "weight": 0.5}},
                "description": "Tendência à busca de atenção em contextos profissionais",
                "workplace_impacts": [
                    "Comportamentos dramáticos em reuniões",
                    "Necessidade excessiva de reconhecimento",
                    "Dificuldade em ouvir outros"
                ],
                "recommendations": [
                    "Canalização positiva da expressividade",
                    "Treinamento em escuta ativa",
                    "Estrutura clara de reconhecimento"
                ]
            }
        }
        
        # Combinações de risco psicossocial (sem terminologia clínica)
        self.risk_combinations = {
            "burnout_risk": {
                "pattern": "Alto D + Alto C + Baixo S",
                "description": "Alto risco de esgotamento profissional",
                "intervention": "Gestão de carga de trabalho e técnicas de relaxamento"
            },
            "isolation_risk": {
                "pattern": "Alto C + Baixo I + Baixo D", 
                "description": "Risco de isolamento social no trabalho",
                "intervention": "Integração gradual em atividades de equipe"
            },
            "anxiety_risk": {
                "pattern": "Alto S + Alto C + Baixo D",
                "description": "Elevada tendência à ansiedade organizacional",
                "intervention": "Técnicas de gestão de ansiedade e clareza processual"
            }
        }
    
    def analyze_behavioral_patterns(self, disc_scores: Dict) -> Dict:
        """
        Analisar padrões comportamentais organizacionais
        
        Args:
            disc_scores: Scores DISC do indivíduo
            
        Returns:
            dict: Análise de padrões comportamentais (não clínicos)
        """
        
        analysis = {
            "identified_patterns": [],
            "risk_combinations": [],
            "overall_risk_score": 0,
            "workplace_recommendations": [],
            "requires_management_support": False,
            "behavioral_insights": ""
        }
        
        # Identificar padrões comportamentais
        for pattern_name, pattern_data in self.behavioral_patterns.items():
            if self._matches_pattern(disc_scores, pattern_data["disc_indicators"]):
                analysis["identified_patterns"].append({
                    "pattern": pattern_name.replace("_", " ").title(),
                    "description": pattern_data["description"],
                    "workplace_impacts": pattern_data["workplace_impacts"],
                    "recommendations": pattern_data["recommendations"]
                })
        
        # Verificar combinações de risco
        for risk_name, risk_data in self.risk_combinations.items():
            if self._matches_risk_combination(disc_scores, risk_data["pattern"]):
                analysis["risk_combinations"].append({
                    "risk_type": risk_name.replace("_", " ").title(),
                    "description": risk_data["description"],
                    "intervention": risk_data["intervention"]
                })
        
        # Calcular score de risco organizacional
        pattern_count = len(analysis["identified_patterns"])
        risk_count = len(analysis["risk_combinations"])
        analysis["overall_risk_score"] = min(100, (pattern_count * 20) + (risk_count * 30))
        
        # Determinar necessidade de suporte gerencial
        analysis["requires_management_support"] = (
            analysis["overall_risk_score"] > 60 or 
            len(analysis["risk_combinations"]) > 1
        )
        
        # Gerar insights comportamentais
        analysis["behavioral_insights"] = self._generate_behavioral_insights(
            disc_scores, analysis["identified_patterns"]
        )
        
        return analysis
    
    def _matches_pattern(self, disc_scores: Dict, indicators: Dict) -> bool:
        """Verificar se scores correspondem ao padrão"""
        
        matches = 0
        total_indicators = 0
        
        for style, criteria in indicators.items():
            total_indicators += 1
            score = disc_scores.get(style, 0)
            
            if "min" in criteria and score >= criteria["min"]:
                matches += criteria.get("weight", 1)
            elif "max" in criteria and score <= criteria["max"]:
                matches += criteria.get("weight", 1)
        
        # Requer pelo menos 70% de correspondência ponderada
        return matches >= (total_indicators * 0.7)
    
    def _matches_risk_combination(self, disc_scores: Dict, pattern: str) -> bool:
        """Verificar se scores correspondem à combinação de risco"""
        
        # Parsing simples dos padrões
        if "Alto D + Alto C + Baixo S" in pattern:
            return (disc_scores.get('D', 0) >= 70 and 
                   disc_scores.get('C', 0) >= 70 and 
                   disc_scores.get('S', 0) <= 30)
        elif "Alto C + Baixo I + Baixo D" in pattern:
            return (disc_scores.get('C', 0) >= 70 and 
                   disc_scores.get('I', 0) <= 30 and 
                   disc_scores.get('D', 0) <= 30)
        elif "Alto S + Alto C + Baixo D" in pattern:
            return (disc_scores.get('S', 0) >= 70 and 
                   disc_scores.get('C', 0) >= 70 and 
                   disc_scores.get('D', 0) <= 30)
        
        return False
    
    def _generate_behavioral_insights(self, disc_scores: Dict, patterns: List) -> str:
        """Gerar insights comportamentais contextualizados"""
        
        primary_style = max(disc_scores, key=disc_scores.get)
        insights = []
        
        if patterns:
            insights.append(f"Perfil {primary_style} apresenta {len(patterns)} padrão(ões) comportamental(is) relevante(s) para o ambiente de trabalho.")
            
            for pattern in patterns[:2]:  # Limitar a 2 para brevidade
                insights.append(f"• {pattern['description']}")
        else:
            insights.append(f"Perfil {primary_style} apresenta padrões comportamentais dentro da normalidade organizacional.")
        
        return " ".join(insights)
    
    def generate_workplace_report(self, disc_scores: Dict, analysis: Dict) -> str:
        """Gerar relatório para uso organizacional (não clínico)"""
        
        report_sections = []
        
        # Cabeçalho
        report_sections.append("RELATÓRIO DE PADRÕES COMPORTAMENTAIS ORGANIZACIONAIS")
        report_sections.append("=" * 60)
        report_sections.append(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
        report_sections.append(f"Perfil DISC: {dict(disc_scores)}")
        report_sections.append("")
        
        # Padrões identificados
        if analysis["identified_patterns"]:
            report_sections.append("PADRÕES COMPORTAMENTAIS IDENTIFICADOS:")
            for i, pattern in enumerate(analysis["identified_patterns"], 1):
                report_sections.append(f"{i}. {pattern['pattern']}")
                report_sections.append(f"   Descrição: {pattern['description']}")
                report_sections.append(f"   Impactos no trabalho:")
                for impact in pattern['workplace_impacts']:
                    report_sections.append(f"   • {impact}")
                report_sections.append("")
        
        # Combinações de risco
        if analysis["risk_combinations"]:
            report_sections.append("FATORES DE RISCO PSICOSSOCIAL:")
            for risk in analysis["risk_combinations"]:
                report_sections.append(f"• {risk['risk_type']}: {risk['description']}")
                report_sections.append(f"  Intervenção sugerida: {risk['intervention']}")
            report_sections.append("")
        
        # Recomendações
        all_recommendations = []
        for pattern in analysis["identified_patterns"]:
            all_recommendations.extend(pattern["recommendations"])
        
        if all_recommendations:
            report_sections.append("RECOMENDAÇÕES PARA DESENVOLVIMENTO:")
            for i, rec in enumerate(set(all_recommendations), 1):
                report_sections.append(f"{i}. {rec}")
            report_sections.append("")
        
        # Suporte gerencial
        if analysis["requires_management_support"]:
            report_sections.append("SUPORTE GERENCIAL RECOMENDADO:")
            report_sections.append("• Acompanhamento mais próximo da liderança")
            report_sections.append("• Adaptações no ambiente de trabalho")
            report_sections.append("• Possível encaminhamento para suporte profissional externo")
        
        # Disclaimer
        report_sections.append("")
        report_sections.append("DISCLAIMER:")
        report_sections.append("Este relatório analisa padrões comportamentais organizacionais")
        report_sections.append("e NÃO constitui diagnóstico clínico ou psicológico.")
        report_sections.append("Para questões de saúde mental, consulte profissional licenciado.")
        
        return "\n".join(report_sections)


# Instância global
behavioral_analyzer = BehavioralPatternAnalyzer()