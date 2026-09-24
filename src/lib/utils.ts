/**
 * Utilitários de formatação
 *
 * Funções auxiliares para formatação de valores monetários,
 * datas e strings usadas em toda a aplicação.
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma data no padrão brasileiro (dd/mm/aaaa)
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}

/**
 * Formata uma data no formato longo (ex: "15 de setembro de 2026")
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Calcula a diferença em dias entre duas datas (inclusive)
 */
export function daysBetween(start: Date | string, end: Date | string): number {
  const s = typeof start === "string" ? new Date(start) : start;
  const e = typeof end === "string" ? new Date(end) : end;
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Gera as iniciais de um nome (ex: "Fábio Silva" → "FS")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Trunca um texto em um número máximo de caracteres
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Gera uma cor de categoria baseada em hash
 */
export function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Salário": "#10B981",
    "Freelance": "#6366F1",
    "Alimentação": "#F59E0B",
    "Moradia": "#EF4444",
    "Transporte": "#3B82F6",
    "Saúde": "#EC4899",
    "Educação": "#8B5CF6",
    "Assinaturas": "#14B8A6",
    "Lazer": "#F97316",
  };

  return colors[category] || "#6B7280";
}

/**
 * Formata o status de um WorkOrder para exibição
 */
export function formatWorkOrderStatus(status: string): string {
  const statusMap: Record<string, string> = {
    SCHEDULED: "Agendado",
    COMPLETED: "Concluído",
    PENDING_PAYMENT: "Aguardando Pagamento",
    CONCILIATED: "Conciliado",
  };

  return statusMap[status] || status;
}

/**
 * Retorna a cor do badge de status do WorkOrder
 */
export function workOrderStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    SCHEDULED: "#3B82F6",       // Azul
    COMPLETED: "#F59E0B",       // Amarelo
    PENDING_PAYMENT: "#EF4444", // Vermelho
    CONCILIATED: "#10B981",     // Verde
  };

  return colorMap[status] || "#6B7280";
}
