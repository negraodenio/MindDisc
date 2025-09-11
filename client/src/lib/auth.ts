export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function handleAuthError(response: Response): void {
  if (response.status === 401 || response.status === 403) {
    // Token expirado ou inválido - limpar dados de autenticação
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Forçar reload da página para redirecionar para login
    window.location.reload();
  }
}
