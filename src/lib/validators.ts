/**
 * Valida um CPF brasileiro
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;

  return true;
}

/**
 * Valida um email
 * @param email - Email para validar
 * @returns true se o email é válido
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // Remove espaços em branco
  const trimmed = email.trim();

  // Verifica tamanho mínimo e máximo
  if (trimmed.length < 5 || trimmed.length > 254) return false;

  // Regex mais robusta para validação de email
  // Baseada na RFC 5322 (simplificada)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) return false;

  // Verifica se tem @ único
  const atCount = (trimmed.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  // Divide em local e domínio
  const [local, domain] = trimmed.split('@');

  // Validações do local (antes do @)
  if (!local || local.length > 64) return false;
  if (local.startsWith('.') || local.endsWith('.')) return false;
  if (local.includes('..')) return false;

  // Validações do domínio (depois do @)
  if (!domain || domain.length > 253) return false;
  if (domain.startsWith('.') || domain.endsWith('.')) return false;
  if (domain.includes('..')) return false;

  // Verifica se tem pelo menos um ponto no domínio
  if (!domain.includes('.')) return false;

  // Verifica extensão do domínio (TLD)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) return false;

  return true;
}

/**
 * Valida um telefone brasileiro
 * @param phone - Telefone com ou sem formatação
 * @returns true se o telefone é válido
 */
export function validatePhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');

  // Verifica se tem 10 ou 11 dígitos (com ou sem 9º dígito)
  if (cleanPhone.length < 10 || cleanPhone.length > 11) return false;

  // Verifica se o DDD é válido (11-99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;

  return true;
}
