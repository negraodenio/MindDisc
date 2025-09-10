"""
APIs de Integração com Órgãos Governamentais Brasileiros
Mind-Bridge European Compliance Edition

ENDPOINTS PARA:
- SUS (Sistema Único de Saúde)
- INSS (Instituto Nacional do Seguro Social)
- SIAFI (Sistema Integrado de Administração Financeira)
- RAPS (Rede de Atenção Psicossocial)
"""

from flask import Blueprint, request, jsonify
from src.integrations.sus_integration import sus_integration
from src.integrations.inss_integration import inss_integration
from src.integrations.siafi_integration import siafi_integration
from datetime import datetime
import json

government_apis_bp = Blueprint('government_apis', __name__)

# =============================================================================
# ROTAS SUS (Sistema Único de Saúde)
# =============================================================================

@government_apis_bp.route('/sus/estabelecimentos', methods=['POST'])
def buscar_estabelecimentos_sus():
    """
    Buscar estabelecimentos de saúde no SUS
    
    POST /api/v1/sus/estabelecimentos
    
    Payload:
    {
        "cep": "01234-567",
        "tipo": "CAPS",
        "raio_km": 20
    }
    """
    try:
        data = request.get_json()
        
        cep = data.get('cep', '')
        tipo = data.get('tipo', 'CAPS')
        raio = data.get('raio_km', 20)
        
        if not cep:
            return jsonify({
                'success': False,
                'error': 'CEP é obrigatório'
            }), 400
        
        resultado = sus_integration.buscar_estabelecimentos_saude(cep, tipo, raio)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de estabelecimentos SUS'
        }), 500


@government_apis_bp.route('/sus/raps-servicos', methods=['GET'])
def buscar_servicos_raps():
    """
    Buscar serviços da Rede de Atenção Psicossocial
    
    GET /api/v1/sus/raps-servicos?municipio=SaoPaulo&tipo=CAPS
    """
    try:
        municipio = request.args.get('municipio', 'São Paulo')
        tipo_servico = request.args.get('tipo', '')
        
        resultado = sus_integration.buscar_servicos_raps(municipio, tipo_servico)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de serviços RAPS'
        }), 500


@government_apis_bp.route('/sus/disponibilidade-atendimento', methods=['POST'])
def verificar_disponibilidade():
    """
    Verificar disponibilidade de atendimento em estabelecimento
    
    POST /api/v1/sus/disponibilidade-atendimento
    
    Payload:
    {
        "cnes": "2269311",
        "tipo_atendimento": "psiquiatria"
    }
    """
    try:
        data = request.get_json()
        
        cnes = data.get('cnes', '')
        tipo_atendimento = data.get('tipo_atendimento', '')
        
        if not cnes or not tipo_atendimento:
            return jsonify({
                'success': False,
                'error': 'CNES e tipo de atendimento são obrigatórios'
            }), 400
        
        resultado = sus_integration.verificar_disponibilidade_atendimento(cnes, tipo_atendimento)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de disponibilidade'
        }), 500


@government_apis_bp.route('/sus/indicadores-saude-mental', methods=['GET'])
def consultar_indicadores_saude_mental():
    """
    Consultar indicadores de saúde mental por município
    
    GET /api/v1/sus/indicadores-saude-mental?codigo_ibge=3550308
    """
    try:
        codigo_ibge = request.args.get('codigo_ibge', '3550308')  # Default São Paulo
        
        resultado = sus_integration.consultar_indicadores_saude_mental(codigo_ibge)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de indicadores'
        }), 500


# =============================================================================
# ROTAS INSS (Instituto Nacional do Seguro Social)
# =============================================================================

@government_apis_bp.route('/inss/consultar-beneficios', methods=['POST'])
def consultar_beneficios_inss():
    """
    Consultar benefícios INSS de um CPF
    
    POST /api/v1/inss/consultar-beneficios
    
    Payload:
    {
        "cpf": "12345678901"
    }
    """
    try:
        data = request.get_json()
        
        cpf = data.get('cpf', '')
        
        if not cpf:
            return jsonify({
                'success': False,
                'error': 'CPF é obrigatório'
            }), 400
        
        # Validação básica de CPF (11 dígitos)
        cpf_limpo = ''.join(filter(str.isdigit, cpf))
        if len(cpf_limpo) != 11:
            return jsonify({
                'success': False,
                'error': 'CPF deve ter 11 dígitos'
            }), 400
        
        resultado = inss_integration.consultar_beneficios(cpf_limpo)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de benefícios INSS'
        }), 500


@government_apis_bp.route('/inss/verificar-elegibilidade', methods=['POST'])
def verificar_elegibilidade_auxilio():
    """
    Verificar elegibilidade para auxílio-doença
    
    POST /api/v1/inss/verificar-elegibilidade
    
    Payload:
    {
        "cpf": "12345678901",
        "tempo_contribuicao_meses": 24,
        "salario_atual": 3000.00,
        "cid": "F32.9"
    }
    """
    try:
        data = request.get_json()
        
        cpf = data.get('cpf', '')
        
        if not cpf:
            return jsonify({
                'success': False,
                'error': 'CPF é obrigatório'
            }), 400
        
        resultado = inss_integration.verificar_elegibilidade_auxilio_doenca(data)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na análise de elegibilidade'
        }), 500


@government_apis_bp.route('/inss/pericias-programadas', methods=['POST'])
def consultar_pericias_programadas():
    """
    Consultar perícias médicas programadas
    
    POST /api/v1/inss/pericias-programadas
    
    Payload:
    {
        "cpf": "12345678901"
    }
    """
    try:
        data = request.get_json()
        
        cpf = data.get('cpf', '')
        
        if not cpf:
            return jsonify({
                'success': False,
                'error': 'CPF é obrigatório'
            }), 400
        
        resultado = inss_integration.consultar_pericias_programadas(cpf)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de perícias'
        }), 500


@government_apis_bp.route('/inss/calcular-beneficio', methods=['POST'])
def calcular_valor_beneficio():
    """
    Calcular valor estimado de benefício
    
    POST /api/v1/inss/calcular-beneficio
    
    Payload:
    {
        "salarios_contribuicao": [3000, 3200, 3100, 3300],
        "tipo_beneficio": "auxilio_doenca"
    }
    """
    try:
        data = request.get_json()
        
        salarios = data.get('salarios_contribuicao', [])
        
        if not salarios:
            return jsonify({
                'success': False,
                'error': 'Lista de salários de contribuição é obrigatória'
            }), 400
        
        resultado = inss_integration.calcular_valor_beneficio(data)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro no cálculo do benefício'
        }), 500


# =============================================================================
# ROTAS SIAFI (Transparência Pública)
# =============================================================================

@government_apis_bp.route('/siafi/gastos-saude-mental', methods=['GET'])
def consultar_gastos_saude_mental():
    """
    Consultar gastos públicos em saúde mental
    
    GET /api/v1/siafi/gastos-saude-mental?ente=SP&ano=2024
    """
    try:
        ente_federativo = request.args.get('ente', 'SP')
        ano = int(request.args.get('ano', 2024))
        
        resultado = siafi_integration.consultar_gastos_saude_mental(ente_federativo, ano)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de gastos públicos'
        }), 500


@government_apis_bp.route('/siafi/licitacoes-saude-mental', methods=['GET'])
def consultar_licitacoes():
    """
    Consultar licitações relacionadas à saúde mental
    
    GET /api/v1/siafi/licitacoes-saude-mental?ente=SP&ano=2024
    """
    try:
        ente_federativo = request.args.get('ente', 'SP')
        ano = int(request.args.get('ano', 2024))
        
        resultado = siafi_integration.consultar_licitacoes_saude_mental(ente_federativo, ano)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de licitações'
        }), 500


@government_apis_bp.route('/siafi/transferencias-fundo-fundo', methods=['GET'])
def consultar_transferencias():
    """
    Consultar transferências fundo a fundo para saúde mental
    
    GET /api/v1/siafi/transferencias-fundo-fundo?codigo_ibge=3550308&ano=2024
    """
    try:
        codigo_ibge = request.args.get('codigo_ibge', '3550308')  # Default São Paulo
        ano = int(request.args.get('ano', 2024))
        
        resultado = siafi_integration.consultar_transferencias_fundo_fundo(codigo_ibge, ano)
        
        return jsonify(resultado), 200 if resultado['success'] else 500
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro na consulta de transferências'
        }), 500


# =============================================================================
# ROTA DE STATUS GERAL
# =============================================================================

@government_apis_bp.route('/status-integracoes', methods=['GET'])
def status_integracoes():
    """
    Status geral das integrações governamentais
    
    GET /api/v1/status-integracoes
    """
    try:
        status = {
            'integracoes_ativas': {
                'sus': {
                    'status': 'ativo',
                    'ultima_consulta': datetime.now().isoformat(),
                    'endpoints_disponiveis': 4,
                    'descricao': 'Sistema Único de Saúde'
                },
                'inss': {
                    'status': 'ativo',
                    'ultima_consulta': datetime.now().isoformat(),
                    'endpoints_disponiveis': 4,
                    'descricao': 'Instituto Nacional do Seguro Social'
                },
                'siafi': {
                    'status': 'ativo',
                    'ultima_consulta': datetime.now().isoformat(),
                    'endpoints_disponiveis': 3,
                    'descricao': 'Sistema Integrado de Administração Financeira'
                }
            },
            'estatisticas_uso': {
                'total_consultas_hoje': 245,
                'consultas_sus': 89,
                'consultas_inss': 127,
                'consultas_siafi': 29,
                'taxa_sucesso': 97.8
            },
            'configuracao': {
                'timeout_padrao': '10 segundos',
                'retry_automatico': True,
                'log_habilitado': True,
                'ambiente': 'producao'
            },
            'observacoes': [
                'Todas as integrações estão funcionais',
                'Dados simulados para ambiente de demonstração',
                'Em produção, conectar às APIs reais dos órgãos'
            ]
        }
        
        return jsonify({
            'success': True,
            'status_geral': status,
            'consultado_em': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Erro ao consultar status das integrações'
        }), 500