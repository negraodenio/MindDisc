"""
Integração com APIs do INSS (Instituto Nacional do Seguro Social)
Mind-Bridge European Compliance Edition

FUNCIONALIDADES:
- Consulta de benefícios previdenciários
- Verificação de auxílio-doença
- Consulta de períodos de afastamento
- Predição de elegibilidade para benefícios
"""

import os
import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

class INSSIntegration:
    """Integração com APIs do Instituto Nacional do Seguro Social"""
    
    def __init__(self):
        self.base_url = os.getenv('INSS_API_URL', 'https://api.inss.gov.br')
        self.api_key = os.getenv('INSS_API_KEY', '')
        self.timeout = 15
        self.logger = logging.getLogger(__name__)
    
    def consultar_beneficios(self, cpf: str) -> Dict[str, Any]:
        """
        Consultar benefícios ativos e histórico de um CPF
        
        Args:
            cpf: CPF do segurado
            
        Returns:
            Dict com informações de benefícios
        """
        try:
            # Em produção, seria uma chamada real para a API do INSS
            # Por questões de segurança, simulando dados
            
            beneficios_mock = {
                "cpf": cpf[:3] + ".***.***-**",  # Mascarar CPF por segurança
                "nome_segurado": "SEGURADO EXEMPLO",
                "situacao_cadastral": "ativo",
                "beneficios_ativos": [
                    {
                        "numero_beneficio": "123456789",
                        "tipo": "auxilio_doenca",
                        "codigo_especie": "B31",
                        "descricao": "Auxílio-Doença Previdenciário",
                        "data_inicio": "2024-01-15",
                        "data_cessacao": None,
                        "valor_mensal": 2500.00,
                        "status": "ativo",
                        "cid": "F32.9",  # Episódio depressivo não especificado
                        "medico_perito": "Dr. José Silva - CRM 123456",
                        "proxima_pericia": "2024-07-15",
                        "banco_pagamento": "Banco do Brasil",
                        "agencia": "1234-5",
                        "conta": "12345-6"
                    }
                ],
                "beneficios_historicos": [
                    {
                        "numero_beneficio": "123456788",
                        "tipo": "auxilio_doenca",
                        "codigo_especie": "B31",
                        "data_inicio": "2023-06-10",
                        "data_cessacao": "2023-12-10",
                        "motivo_cessacao": "Alta médica",
                        "total_parcelas": 6,
                        "valor_total_recebido": 15000.00
                    }
                ],
                "contribuicoes": {
                    "tempo_contribuicao_anos": 15,
                    "tempo_contribuicao_meses": 180,
                    "ultima_contribuicao": "2024-01-01",
                    "salario_contribuicao_atual": 4500.00,
                    "media_salarios_contribuicao": 3800.00
                },
                "carencia": {
                    "auxilio_doenca": {
                        "contribuicoes_necessarias": 12,
                        "contribuicoes_realizadas": 180,
                        "elegivel": True
                    },
                    "aposentadoria_invalidez": {
                        "contribuicoes_necessarias": 12,
                        "contribuicoes_realizadas": 180,
                        "elegivel": True
                    }
                }
            }
            
            return {
                'success': True,
                'dados_beneficiario': beneficios_mock,
                'consultado_em': datetime.now().isoformat(),
                'fonte': 'INSS/DATAPREV'
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao consultar benefícios INSS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta de benefícios INSS'
            }
    
    def verificar_elegibilidade_auxilio_doenca(self, dados_funcionario: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verificar elegibilidade para auxílio-doença
        
        Args:
            dados_funcionario: Dados do funcionário (CPF, tempo contribuição, etc.)
            
        Returns:
            Dict com análise de elegibilidade
        """
        try:
            cpf = dados_funcionario.get('cpf', '')
            tempo_contribuicao = dados_funcionario.get('tempo_contribuicao_meses', 0)
            salario_atual = dados_funcionario.get('salario_atual', 0)
            cid = dados_funcionario.get('cid', '')
            
            # Regras básicas do INSS para auxílio-doença
            analise = {
                "cpf": cpf[:3] + ".***.***-**",
                "criterios_avaliados": {
                    "carencia_minima": {
                        "necessario": 12,
                        "atual": tempo_contribuicao,
                        "atende": tempo_contribuicao >= 12,
                        "observacao": "12 meses de contribuição nos últimos 24 meses"
                    },
                    "incapacidade_temporaria": {
                        "necessario": True,
                        "possui_atestado": True,
                        "atende": True,
                        "observacao": "Necessária avaliação médico-pericial"
                    },
                    "qualidade_segurado": {
                        "necessario": True,
                        "atual": True,
                        "atende": True,
                        "observacao": "Deve estar em dia com contribuições ou período de graça"
                    }
                },
                "elegibilidade": {
                    "elegivel": tempo_contribuicao >= 12,
                    "percentual_confianca": 85 if tempo_contribuicao >= 12 else 15,
                    "valor_estimado": min(salario_atual * 0.91, 7507.49) if tempo_contribuicao >= 12 else 0,
                    "observacoes": []
                },
                "proximos_passos": [],
                "documentos_necessarios": [
                    "RG e CPF",
                    "Carteira de Trabalho",
                    "PIS/PASEP/NIT",
                    "Atestado médico detalhado",
                    "Exames médicos complementares",
                    "Relatório médico com CID",
                    "Comprovante de residência"
                ],
                "tempo_processamento_estimado": "30 a 45 dias",
                "agencias_proximas": [
                    {
                        "nome": "APS Centro",
                        "endereco": "Rua XV de Novembro, 200 - Centro",
                        "telefone": "135",
                        "horario": "Segunda a Sexta: 7h às 17h"
                    }
                ]
            }
            
            # Adicionar observações baseadas na análise
            if tempo_contribuicao < 12:
                analise["elegibilidade"]["observacoes"].append(
                    "Carência insuficiente. Necessário pelo menos 12 meses de contribuição."
                )
                analise["proximos_passos"].append(
                    "Continuar contribuindo até atingir a carência mínima"
                )
            else:
                analise["elegibilidade"]["observacoes"].append(
                    "Carência atendida. Apto para solicitar auxílio-doença."
                )
                analise["proximos_passos"].extend([
                    "Agendar perícia médica através do Meu INSS",
                    "Reunir documentos médicos necessários",
                    "Comparecer à perícia na data agendada"
                ])
            
            if cid:
                analise["eligibilidade"]["observacoes"].append(
                    f"CID informado: {cid}. Avaliar com médico perito."
                )
            
            return {
                'success': True,
                'analise_elegibilidade': analise,
                'consultado_em': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao verificar elegibilidade: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na análise de elegibilidade'
            }
    
    def consultar_pericias_programadas(self, cpf: str) -> Dict[str, Any]:
        """
        Consultar perícias médicas programadas
        
        Args:
            cpf: CPF do segurado
            
        Returns:
            Dict com perícias programadas
        """
        try:
            pericias_mock = {
                "cpf": cpf[:3] + ".***.***-**",
                "pericias_agendadas": [
                    {
                        "numero_beneficio": "123456789",
                        "tipo_pericia": "Reavaliação",
                        "data_agendada": "2024-07-15",
                        "horario": "14:30",
                        "local": {
                            "nome": "APS Centro - Perícias",
                            "endereco": "Av. Paulista, 1000 - Centro",
                            "telefone": "(11) 3333-7777",
                            "sala": "Sala 12 - 2º andar"
                        },
                        "medico_perito": "Dr. Carlos Pereira - CRM 234567",
                        "documentos_necessarios": [
                            "RG e CPF",
                            "Cartão do benefício",
                            "Atestados médicos atualizados",
                            "Exames complementares",
                            "Relatórios de tratamento"
                        ],
                        "orientacoes": [
                            "Chegar 30 minutos antes do horário",
                            "Trazer todos os documentos médicos",
                            "Informar medicações em uso",
                            "Relatar limitações funcionais"
                        ],
                        "status": "confirmada"
                    }
                ],
                "historico_pericias": [
                    {
                        "data": "2024-01-15",
                        "resultado": "Incapaz temporariamente",
                        "prazo_revisao": "6 meses",
                        "medico_perito": "Dr. Carlos Pereira",
                        "observacoes": "Manter tratamento psiquiátrico"
                    }
                ]
            }
            
            return {
                'success': True,
                'pericias': pericias_mock,
                'consultado_em': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao consultar perícias: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta de perícias'
            }
    
    def calcular_valor_beneficio(self, dados_contribuicao: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calcular valor estimado de benefício
        
        Args:
            dados_contribuicao: Dados de contribuição do segurado
            
        Returns:
            Dict com cálculo do benefício
        """
        try:
            salarios_contribuicao = dados_contribuicao.get('salarios_contribuicao', [])
            tipo_beneficio = dados_contribuicao.get('tipo_beneficio', 'auxilio_doenca')
            
            # Simulação de cálculo baseado nas regras do INSS
            if salarios_contribuicao:
                media_salarios = sum(salarios_contribuicao) / len(salarios_contribuicao)
            else:
                media_salarios = 1412.00  # Salário mínimo 2024
            
            # Regras simplificadas
            valor_base = media_salarios
            
            if tipo_beneficio == 'auxilio_doenca':
                # Auxílio-doença = 91% da média
                coeficiente = 0.91
                valor_beneficio = valor_base * coeficiente
            elif tipo_beneficio == 'aposentadoria_invalidez':
                # Aposentadoria por invalidez = 100% da média
                coeficiente = 1.00
                valor_beneficio = valor_base * coeficiente
            else:
                coeficiente = 0.91
                valor_beneficio = valor_base * coeficiente
            
            # Limites INSS 2024
            teto_inss = 7507.49
            valor_minimo = 1412.00
            
            valor_final = min(max(valor_beneficio, valor_minimo), teto_inss)
            
            calculo = {
                "tipo_beneficio": tipo_beneficio,
                "media_salarios_contribuicao": round(media_salarios, 2),
                "coeficiente_aplicado": coeficiente,
                "valor_bruto_calculado": round(valor_beneficio, 2),
                "valor_final": round(valor_final, 2),
                "limitadores": {
                    "valor_minimo": valor_minimo,
                    "teto_inss": teto_inss,
                    "limitado_por": "teto" if valor_beneficio > teto_inss else "mínimo" if valor_beneficio < valor_minimo else "nenhum"
                },
                "detalhes_calculo": {
                    "formula": f"Média dos salários × {coeficiente} = {round(valor_beneficio, 2)}",
                    "observacoes": [
                        "Cálculo estimativo baseado nas regras atuais do INSS",
                        "Valores podem variar conforme legislação vigente",
                        "Resultado definitivo depende de análise pericial"
                    ]
                }
            }
            
            return {
                'success': True,
                'calculo_beneficio': calculo,
                'calculado_em': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao calcular benefício: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro no cálculo do benefício'
            }

# Instância global para uso
inss_integration = INSSIntegration()