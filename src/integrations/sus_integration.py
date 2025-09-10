"""
Integração com APIs do SUS (Sistema Único de Saúde)
Mind-Bridge European Compliance Edition

FUNCIONALIDADES:
- Consulta de estabelecimentos de saúde
- Busca de serviços RAPS próximos
- Verificação de disponibilidade de atendimentos
- Integração com CNES (Cadastro Nacional de Estabelecimentos de Saúde)
"""

import os
import requests
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import logging

class SUSIntegration:
    """Integração com APIs do Sistema Único de Saúde"""
    
    def __init__(self):
        self.base_url = os.getenv('SUS_API_URL', 'https://apidadosabertos.saude.gov.br')
        self.cnes_url = "https://cnes.datasus.gov.br/api"
        self.timeout = 10
        self.logger = logging.getLogger(__name__)
    
    def buscar_estabelecimentos_saude(self, cep: str, tipo_estabelecimento: str = "CAPS", raio_km: int = 20) -> Dict[str, Any]:
        """
        Buscar estabelecimentos de saúde próximos por CEP
        
        Args:
            cep: CEP de referência
            tipo_estabelecimento: Tipo (CAPS, UBS, HOSPITAL, etc.)
            raio_km: Raio de busca em km
            
        Returns:
            Dict com estabelecimentos encontrados
        """
        try:
            # Simular integração com API do CNES/DATASUS
            # Em produção, seria uma chamada real para a API
            
            estabelecimentos_mock = [
                {
                    "cnes": "2269311",
                    "nome": "CAPS AD Central",
                    "tipo": "CAPS",
                    "subtipo": "CAPS AD",
                    "endereco": {
                        "logradouro": "Rua das Flores, 123",
                        "bairro": "Centro",
                        "municipio": "São Paulo",
                        "uf": "SP",
                        "cep": "01234-567"
                    },
                    "telefone": "(11) 3333-4444",
                    "email": "caps.central@sus.sp.gov.br",
                    "horario_funcionamento": {
                        "segunda_sexta": "08:00-18:00",
                        "sabado": "08:00-12:00",
                        "domingo": "Fechado"
                    },
                    "servicos_disponiveis": [
                        "Atendimento psicológico",
                        "Atendimento psiquiátrico",
                        "Terapia ocupacional",
                        "Grupos terapêuticos",
                        "Atendimento para dependência química"
                    ],
                    "capacidade_atendimento": 50,
                    "distancia_km": 2.3,
                    "status": "ativo",
                    "ultima_atualizacao": "2024-01-15"
                },
                {
                    "cnes": "2269312",
                    "nome": "UBS Vila Madalena",
                    "tipo": "UBS",
                    "subtipo": "Unidade Básica de Saúde",
                    "endereco": {
                        "logradouro": "Av. Paulista, 456",
                        "bairro": "Vila Madalena",
                        "municipio": "São Paulo",
                        "uf": "SP",
                        "cep": "01234-568"
                    },
                    "telefone": "(11) 3333-5555",
                    "email": "ubs.madalena@sus.sp.gov.br",
                    "horario_funcionamento": {
                        "segunda_sexta": "07:00-17:00",
                        "sabado": "07:00-12:00",
                        "domingo": "Fechado"
                    },
                    "servicos_disponiveis": [
                        "Clínica médica",
                        "Psicologia básica",
                        "Enfermagem",
                        "Vacinação",
                        "Encaminhamentos especializados"
                    ],
                    "capacidade_atendimento": 100,
                    "distancia_km": 5.1,
                    "status": "ativo",
                    "ultima_atualizacao": "2024-01-15"
                },
                {
                    "cnes": "2269313",
                    "nome": "CAPS II Norte",
                    "tipo": "CAPS",
                    "subtipo": "CAPS II",
                    "endereco": {
                        "logradouro": "Rua dos Psicólogos, 789",
                        "bairro": "Santana",
                        "municipio": "São Paulo",
                        "uf": "SP",
                        "cep": "01234-569"
                    },
                    "telefone": "(11) 3333-6666",
                    "email": "caps2.norte@sus.sp.gov.br",
                    "horario_funcionamento": {
                        "segunda_sexta": "08:00-18:00",
                        "sabado": "08:00-14:00",
                        "domingo": "Fechado"
                    },
                    "servicos_disponiveis": [
                        "Atendimento psiquiátrico",
                        "Psicoterapia individual",
                        "Psicoterapia em grupo",
                        "Terapia ocupacional",
                        "Atendimento familiar",
                        "Oficinas terapêuticas"
                    ],
                    "capacidade_atendimento": 75,
                    "distancia_km": 8.7,
                    "status": "ativo",
                    "ultima_atualizacao": "2024-01-15"
                }
            ]
            
            # Filtrar por tipo se especificado
            if tipo_estabelecimento and tipo_estabelecimento != "TODOS":
                estabelecimentos_filtrados = [
                    est for est in estabelecimentos_mock 
                    if est['tipo'].upper() == tipo_estabelecimento.upper()
                ]
            else:
                estabelecimentos_filtrados = estabelecimentos_mock
            
            # Filtrar por raio
            estabelecimentos_filtrados = [
                est for est in estabelecimentos_filtrados 
                if est['distancia_km'] <= raio_km
            ]
            
            return {
                'success': True,
                'total_encontrados': len(estabelecimentos_filtrados),
                'estabelecimentos': estabelecimentos_filtrados,
                'parametros_busca': {
                    'cep': cep,
                    'tipo': tipo_estabelecimento,
                    'raio_km': raio_km
                },
                'consultado_em': datetime.now().isoformat(),
                'fonte': 'CNES/DATASUS'
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao buscar estabelecimentos SUS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta aos estabelecimentos de saúde'
            }
    
    def verificar_disponibilidade_atendimento(self, cnes: str, tipo_atendimento: str) -> Dict[str, Any]:
        """
        Verificar disponibilidade de atendimento em estabelecimento específico
        
        Args:
            cnes: Código CNES do estabelecimento
            tipo_atendimento: Tipo de atendimento (psiquiatria, psicologia, etc.)
            
        Returns:
            Dict com informações de disponibilidade
        """
        try:
            # Simular consulta de disponibilidade
            disponibilidade_mock = {
                "cnes": cnes,
                "tipo_atendimento": tipo_atendimento,
                "disponibilidade": {
                    "proxima_vaga": "2024-02-15",
                    "tempo_espera_medio": "14 dias",
                    "vagas_mes_atual": 3,
                    "lista_espera": 15
                },
                "horarios_disponiveis": [
                    {"data": "2024-02-15", "hora": "14:00", "profissional": "Dr. Silva"},
                    {"data": "2024-02-16", "hora": "09:30", "profissional": "Dra. Santos"},
                    {"data": "2024-02-20", "hora": "16:00", "profissional": "Dr. Silva"}
                ],
                "requisitos": [
                    "Cartão SUS ativo",
                    "Encaminhamento médico (se especialidade)",
                    "Comprovante de residência"
                ],
                "contato_agendamento": {
                    "telefone": "(11) 3333-4444",
                    "whatsapp": "(11) 99999-4444",
                    "email": "agendamento@estabelecimento.sus.gov.br"
                }
            }
            
            return {
                'success': True,
                'disponibilidade': disponibilidade_mock,
                'consultado_em': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao verificar disponibilidade: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta de disponibilidade'
            }
    
    def buscar_servicos_raps(self, municipio: str, tipo_servico: str = "") -> Dict[str, Any]:
        """
        Buscar serviços da Rede de Atenção Psicossocial (RAPS)
        
        Args:
            municipio: Nome do município
            tipo_servico: Tipo específico (CAPS, CAPS AD, CAPS IJ, etc.)
            
        Returns:
            Dict com serviços RAPS disponíveis
        """
        try:
            servicos_raps = [
                {
                    "tipo": "CAPS I",
                    "nome": "CAPS I Centro",
                    "populacao_atendida": "20.000 a 70.000 habitantes",
                    "servicos": [
                        "Atendimento individual",
                        "Atendimento em grupo",
                        "Oficinas terapêuticas",
                        "Visita domiciliar",
                        "Atendimento à família"
                    ],
                    "endereco": "Rua Central, 100 - Centro",
                    "telefone": "(11) 3333-1111",
                    "horario": "Segunda a Sexta: 8h às 18h"
                },
                {
                    "tipo": "CAPS AD",
                    "nome": "CAPS AD Specialized",
                    "populacao_atendida": "Acima de 70.000 habitantes",
                    "servicos": [
                        "Desintoxicação",
                        "Psicoterapia individual",
                        "Psicoterapia em grupo",
                        "Terapia ocupacional",
                        "Programa de redução de danos"
                    ],
                    "endereco": "Av. Saúde, 200 - Vila Nova",
                    "telefone": "(11) 3333-2222",
                    "horario": "24 horas (urgências)"
                },
                {
                    "tipo": "CAPS IJ",
                    "nome": "CAPS Infantojuvenil",
                    "populacao_atendida": "Crianças e adolescentes",
                    "servicos": [
                        "Atendimento psiquiátrico infantil",
                        "Psicoterapia lúdica",
                        "Terapia familiar",
                        "Grupos de adolescentes",
                        "Orientação escolar"
                    ],
                    "endereco": "Rua das Crianças, 300 - Jardim Feliz",
                    "telefone": "(11) 3333-3333",
                    "horario": "Segunda a Sexta: 7h às 19h"
                }
            ]
            
            # Filtrar por tipo se especificado
            if tipo_servico:
                servicos_filtrados = [
                    srv for srv in servicos_raps 
                    if tipo_servico.upper() in srv['tipo'].upper()
                ]
            else:
                servicos_filtrados = servicos_raps
            
            return {
                'success': True,
                'municipio': municipio,
                'total_servicos': len(servicos_filtrados),
                'servicos_raps': servicos_filtrados,
                'tipos_disponiveis': list(set([srv['tipo'] for srv in servicos_raps])),
                'consultado_em': datetime.now().isoformat(),
                'fonte': 'RAPS/SUS'
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao buscar serviços RAPS: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta de serviços RAPS'
            }
    
    def consultar_indicadores_saude_mental(self, codigo_ibge: str) -> Dict[str, Any]:
        """
        Consultar indicadores de saúde mental por município
        
        Args:
            codigo_ibge: Código IBGE do município
            
        Returns:
            Dict com indicadores de saúde mental
        """
        try:
            # Simular dados de indicadores baseados em dados reais do MS
            indicadores = {
                "municipio": {
                    "codigo_ibge": codigo_ibge,
                    "nome": "São Paulo",
                    "populacao": 12325232,
                    "regiao": "Sudeste"
                },
                "estabelecimentos_saude_mental": {
                    "caps_i": 8,
                    "caps_ii": 12,
                    "caps_ij": 6,
                    "caps_ad": 9,
                    "caps_iii": 4,
                    "total_caps": 39
                },
                "cobertura_caps": {
                    "indicador": 0.89,
                    "parametro_ms": 0.70,
                    "status": "adequada",
                    "observacao": "Acima do parâmetro recomendado pelo MS"
                },
                "producao_ambulatorial": {
                    "consultas_psiquiatra": 15420,
                    "consultas_psicologo": 8930,
                    "procedimentos_caps": 45670,
                    "periodo": "últimos 12 meses"
                },
                "internacoes_psiquiatricas": {
                    "total_internacoes": 1234,
                    "taxa_por_100k_hab": 10.01,
                    "tempo_medio_permanencia": 28.5,
                    "reducao_ano_anterior": "-12%"
                },
                "dados_epidemiologicos": {
                    "prevalencia_estimada_depressao": "5.8%",
                    "prevalencia_estimada_ansiedade": "9.3%",
                    "prevalencia_estimada_bipolar": "2.4%",
                    "fonte": "OMS/IBGE 2023"
                },
                "ultima_atualizacao": "2024-01-15",
                "fonte": "DATASUS/SIA-SUS"
            }
            
            return {
                'success': True,
                'indicadores': indicadores,
                'periodo_referencia': '2023',
                'consultado_em': datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Erro ao consultar indicadores: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro na consulta de indicadores de saúde mental'
            }

# Instância global para uso
sus_integration = SUSIntegration()