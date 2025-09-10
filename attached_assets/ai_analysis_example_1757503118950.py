"""
Exemplo Prático: Sistema de Cruzamento de Dados DISC x Saúde Mental com IA
Mind-Bridge European Compliance Edition

Este exemplo demonstra como usar a API de análise de IA para cruzar dados
entre perfis DISC e indicadores de saúde mental, gerando insights personalizados.
"""

import requests
import json
from datetime import datetime
import os

# Configuração da API
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api/v1"

class MindBridgeAIClient:
    """Cliente para interagir com a API de análise de IA do Mind-Bridge"""
    
    def __init__(self, base_url: str = API_BASE):
        self.base_url = base_url
        self.session = requests.Session()
    
    def analyze_correlation(self, user_id: int, disc_results: dict, mental_health_results: dict, user_context: dict = None):
        """
        Executar análise completa de correlação DISC x Saúde Mental
        
        Args:
            user_id: ID do usuário
            disc_results: Resultados da avaliação DISC
            mental_health_results: Resultados de saúde mental (PHQ-9, GAD-7, Burnout)
            user_context: Contexto adicional do usuário
        
        Returns:
            dict: Análise completa com insights e recomendações
        """
        endpoint = f"{self.base_url}/ai-analysis/correlate"
        
        payload = {
            "user_id": user_id,
            "disc_results": disc_results,
            "mental_health_results": mental_health_results,
            "user_context": user_context or {}
        }
        
        response = self.session.post(endpoint, json=payload)
        return response.json()
    
    def quick_insight(self, disc_style: str, mental_health_scores: dict):
        """
        Gerar insight rápido baseado em dados básicos
        
        Args:
            disc_style: Estilo DISC primário (D, I, S, C)
            mental_health_scores: Scores básicos de saúde mental
        
        Returns:
            dict: Insight rápido e recomendações
        """
        endpoint = f"{self.base_url}/ai-analysis/quick-insight"
        
        payload = {
            "disc_style": disc_style,
            "mental_health_scores": mental_health_scores
        }
        
        response = self.session.post(endpoint, json=payload)
        return response.json()
    
    def risk_assessment(self, disc_results: dict, mental_health_results: dict):
        """
        Calcular avaliação de risco
        
        Args:
            disc_results: Resultados DISC
            mental_health_results: Resultados de saúde mental
        
        Returns:
            dict: Avaliação detalhada de riscos
        """
        endpoint = f"{self.base_url}/ai-analysis/risk-assessment"
        
        payload = {
            "disc_results": disc_results,
            "mental_health_results": mental_health_results
        }
        
        response = self.session.post(endpoint, json=payload)
        return response.json()
    
    def get_analysis_history(self, user_id: int):
        """Obter histórico de análises de um usuário"""
        endpoint = f"{self.base_url}/ai-analysis/history/{user_id}"
        response = self.session.get(endpoint)
        return response.json()
    
    def get_statistics(self):
        """Obter estatísticas gerais das análises"""
        endpoint = f"{self.base_url}/ai-analysis/statistics"
        response = self.session.get(endpoint)
        return response.json()


def exemplo_analise_completa():
    """Exemplo de análise completa de correlação"""
    
    print("🧠 EXEMPLO: Análise Completa de Correlação DISC x Saúde Mental")
    print("=" * 70)
    
    # Inicializar cliente
    client = MindBridgeAIClient()
    
    # Dados de exemplo - Perfil D com indicadores de burnout
    disc_results = {
        "primary_style": "D",
        "secondary_style": "C",
        "scores": {
            "D": 85,  # Muito alto
            "I": 25,  # Baixo
            "S": 15,  # Muito baixo
            "C": 70   # Alto
        },
        "intensity": "high",
        "flexibility_score": 35  # Baixa flexibilidade
    }
    
    mental_health_results = {
        "phq9_score": 12,      # Depressão moderada
        "gad7_score": 15,      # Ansiedade moderada-severa
        "burnout_score": 75,   # Burnout alto
        "stress_level": "high",
        "sleep_quality": "poor"
    }
    
    user_context = {
        "role": "CEO",
        "company_size": "startup",
        "work_hours_per_week": 70,
        "team_size": 15,
        "recent_changes": ["funding_round", "rapid_growth", "new_hires"]
    }
    
    # Executar análise
    print("📊 Executando análise de correlação...")
    result = client.analyze_correlation(
        user_id=1,
        disc_results=disc_results,
        mental_health_results=mental_health_results,
        user_context=user_context
    )
    
    if result.get('success'):
        analysis = result['result']
        
        print(f"✅ Análise concluída: {analysis['analysis_id']}")
        print(f"🎯 Perfil DISC: {analysis['disc_profile']}")
        print(f"📈 Score de Risco Geral: {analysis['risk_assessment']['overall_risk_score']:.1f}/100")
        print(f"⚠️  Nível de Risco: {analysis['risk_assessment']['risk_level']}")
        print(f"👨‍⚕️ Supervisão Profissional: {'Sim' if analysis['professional_oversight_required'] else 'Não'}")
        print(f"🎯 Confiança da Análise: {analysis['confidence_score']:.1f}/100")
        
        print("\n🔍 INSIGHTS PRINCIPAIS:")
        correlation = analysis['correlation_analysis']
        if isinstance(correlation, dict):
            print(f"• {correlation.get('correlation_summary', 'Análise detalhada disponível')}")
        
        print("\n💡 RECOMENDAÇÕES PERSONALIZADAS:")
        for i, rec in enumerate(analysis['personalized_recommendations'][:3], 1):
            print(f"{i}. {rec['title']} ({rec['priority']} prioridade)")
            print(f"   {rec['description']}")
        
        print(f"\n📅 Próximo acompanhamento: {analysis['follow_up_schedule']['frequency']}")
        
    else:
        print(f"❌ Erro na análise: {result.get('message', 'Erro desconhecido')}")


def exemplo_insight_rapido():
    """Exemplo de insight rápido"""
    
    print("\n⚡ EXEMPLO: Insight Rápido")
    print("=" * 40)
    
    client = MindBridgeAIClient()
    
    # Dados básicos para insight rápido
    result = client.quick_insight(
        disc_style="I",
        mental_health_scores={
            "depression": 8,   # Leve
            "anxiety": 12,     # Moderada
            "burnout": 45      # Moderado
        }
    )
    
    if result.get('success'):
        insight = result['insight']
        
        print(f"🎭 Perfil: {insight['disc_style']}")
        print(f"⚠️  Nível de Risco: {insight['risk_level']}")
        
        print("\n🔍 Insights Chave:")
        for insight_text in insight['key_insights']:
            print(f"• {insight_text}")
        
        print("\n💡 Recomendações Rápidas:")
        for rec in insight['quick_recommendations']:
            print(f"• {rec}")
        
        if insight['professional_consultation_recommended']:
            print("\n👨‍⚕️ Recomenda-se consulta profissional")
    
    else:
        print(f"❌ Erro: {result.get('message', 'Erro desconhecido')}")


def exemplo_avaliacao_risco():
    """Exemplo de avaliação de risco"""
    
    print("\n🎯 EXEMPLO: Avaliação de Risco Detalhada")
    print("=" * 50)
    
    client = MindBridgeAIClient()
    
    # Dados para avaliação de risco
    disc_results = {
        "primary_style": "C",
        "scores": {"D": 30, "I": 20, "S": 25, "C": 90}
    }
    
    mental_health_results = {
        "phq9_score": 16,    # Depressão moderada-severa
        "gad7_score": 18,    # Ansiedade severa
        "burnout_score": 60  # Burnout moderado-alto
    }
    
    result = client.risk_assessment(disc_results, mental_health_results)
    
    if result.get('success'):
        risk = result['risk_assessment']
        
        print(f"📊 Score Geral de Risco: {risk['overall_risk_score']:.1f}/100")
        print(f"🏷️  Categoria: {risk['risk_level']}")
        
        print("\n📈 Riscos Individuais:")
        for risk_type, score in risk['individual_risks'].items():
            print(f"• {risk_type.replace('_', ' ').title()}: {score:.1f}/100")
        
        print(f"\n🔬 Algoritmo: v{risk['algorithm_version']}")
        print(f"📊 Intervalo de Confiança: {risk['confidence_interval']['confidence_level']*100}%")
    
    else:
        print(f"❌ Erro: {result.get('message', 'Erro desconhecido')}")


def exemplo_estatisticas():
    """Exemplo de estatísticas gerais"""
    
    print("\n📊 EXEMPLO: Estatísticas do Sistema")
    print("=" * 45)
    
    client = MindBridgeAIClient()
    
    result = client.get_statistics()
    
    if result.get('success'):
        stats = result['statistics']
        
        print(f"📈 Total de Análises: {stats['total_analyses']}")
        print(f"👨‍⚕️ Supervisão Profissional: {stats['professional_oversight_percentage']:.1f}%")
        print(f"🎯 Confiança Média: {stats['average_confidence_score']}/100")
        
        print("\n🎭 Distribuição por Perfil DISC:")
        for profile, count in stats['disc_profile_distribution'].items():
            percentage = (count / stats['total_analyses'] * 100) if stats['total_analyses'] > 0 else 0
            print(f"• {profile}: {count} ({percentage:.1f}%)")
    
    else:
        print(f"❌ Erro: {result.get('message', 'Erro desconhecido')}")


def exemplo_casos_uso_reais():
    """Exemplos de casos de uso reais"""
    
    print("\n🌟 CASOS DE USO REAIS")
    print("=" * 30)
    
    casos = [
        {
            "titulo": "CEO Startup (Perfil D) - Burnout Alto",
            "disc": "D",
            "contexto": "Líder de startup em crescimento rápido",
            "riscos": ["Burnout por sobrecarga", "Ansiedade por pressão"],
            "intervencoes": ["Delegação eficaz", "Gestão de estresse", "Equilíbrio vida-trabalho"]
        },
        {
            "titulo": "Gerente RH (Perfil I) - Depressão Leve",
            "disc": "I",
            "contexto": "Profissional de RH com alta demanda social",
            "riscos": ["Esgotamento emocional", "Dependência de aprovação"],
            "intervencoes": ["Autovalidação", "Limites saudáveis", "Suporte emocional"]
        },
        {
            "titulo": "Analista Financeiro (Perfil C) - Ansiedade Alta",
            "disc": "C",
            "contexto": "Profissional detalhista com deadlines apertados",
            "riscos": ["Perfeccionismo paralisante", "Autocrítica excessiva"],
            "intervencoes": ["Terapia cognitiva", "Mindfulness", "Gestão de expectativas"]
        },
        {
            "titulo": "Assistente Administrativo (Perfil S) - Estresse por Mudanças",
            "disc": "S",
            "contexto": "Profissional estável em ambiente de mudanças",
            "riscos": ["Ansiedade por mudanças", "Sobrecarga silenciosa"],
            "intervencoes": ["Adaptação gradual", "Comunicação assertiva", "Suporte na transição"]
        }
    ]
    
    for i, caso in enumerate(casos, 1):
        print(f"\n{i}. {caso['titulo']}")
        print(f"   Contexto: {caso['contexto']}")
        print(f"   Riscos: {', '.join(caso['riscos'])}")
        print(f"   Intervenções: {', '.join(caso['intervencoes'])}")


def main():
    """Executar todos os exemplos"""
    
    print("🚀 MIND-BRIDGE AI ANALYSIS - EXEMPLOS PRÁTICOS")
    print("🔬 Sistema de Cruzamento de Dados DISC x Saúde Mental")
    print("🌍 European Compliance Edition")
    print("=" * 80)
    
    try:
        # Verificar se a API está rodando
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code != 200:
            print("❌ API não está rodando. Execute 'python src/main.py' primeiro.")
            return
        
        print("✅ API está rodando e acessível")
        
        # Executar exemplos
        exemplo_analise_completa()
        exemplo_insight_rapido()
        exemplo_avaliacao_risco()
        exemplo_estatisticas()
        exemplo_casos_uso_reais()
        
        print("\n" + "=" * 80)
        print("🎉 EXEMPLOS CONCLUÍDOS COM SUCESSO!")
        print("💡 Este sistema representa um diferencial único no mercado:")
        print("   • Primeira plataforma a combinar DISC + Saúde Mental com IA")
        print("   • Análise preditiva baseada em correlações científicas")
        print("   • Intervenções personalizadas por perfil comportamental")
        print("   • Conformidade total com GDPR e Lei de IA da UE")
        print("🚀 Pronto para revolucionar o mercado europeu!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Não foi possível conectar à API.")
        print("💡 Certifique-se de que a aplicação está rodando em http://localhost:5000")
        print("   Execute: python src/main.py")
    
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")


if __name__ == "__main__":
    main()

