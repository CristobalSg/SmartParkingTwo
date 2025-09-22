// Servicio para detectar tenant basado en el email del usuario
// SRP: Solo responsable de detectar y mapear tenants
export interface ITenantDetectionService {
  detectTenantFromEmail(email: string): string | null;
  getAvailableTenants(): TenantInfo[];
  validateTenantExists(tenantId: string): boolean;
}

export interface TenantInfo {
  id: string;
  name: string;
  domain: string;
  emailDomains: string[];
}

export class TenantDetectionService implements ITenantDetectionService {
  // Mapeo de dominios de email a tenant IDs
  private readonly tenantMappings: TenantInfo[] = [
    {
      id: 'universidad-nacional',
      name: 'Universidad Nacional',
      domain: 'universidad.edu',
      emailDomains: ['universidad.edu', 'uni.edu', 'estudiantes.universidad.edu', 'gmail.com', 'alu.uct.cl']
    },
    {
      id: 'empresa-tech',
      name: 'Tech Solutions Corp',
      domain: 'techsolutions.com',
      emailDomains: ['techsolutions.com', 'tech.com', 'corp.techsolutions.com']
    },
    {
      id: 'hospital-central',
      name: 'Hospital Central',
      domain: 'hospital-central.gov',
      emailDomains: ['hospital-central.gov', 'salud.gov', 'medicos.hospital.gov']
    },
    {
      id: 'municipio-ciudad',
      name: 'Municipio de la Ciudad',
      domain: 'municipio.gov',
      emailDomains: ['municipio.gov', 'gobierno.city', 'admin.municipio.gov']
    }
  ];

  /**
   * Detecta el tenant basado en el dominio del email
   * @param email - Email del usuario
   * @returns Tenant ID o null si no se encuentra
   */
  detectTenantFromEmail(email: string): string | null {
    if (!email || !email.includes('@')) {
      return null;
    }

    const domain = email.split('@')[1].toLowerCase();

    // Buscar tenant que maneje este dominio
    for (const tenant of this.tenantMappings) {
      if (tenant.emailDomains.some(d => d.toLowerCase() === domain)) {
        console.log(`Tenant detected: ${tenant.id} for email domain: ${domain}`);
        return tenant.id;
      }
    }
    return null;
  }

  /**
   * Obtiene lista de todos los tenants disponibles
   * @returns Array de información de tenants
   */
  getAvailableTenants(): TenantInfo[] {
    return [...this.tenantMappings];
  }

  /**
   * Valida si un tenant ID existe
   * @param tenantId - ID del tenant a validar
   * @returns boolean indicando si existe
   */
  validateTenantExists(tenantId: string): boolean {
    return this.tenantMappings.some(t => t.id === tenantId);
  }

  /**
   * Obtiene información de un tenant específico
   * @param tenantId - ID del tenant
   * @returns Información del tenant o null
   */
  getTenantInfo(tenantId: string): TenantInfo | null {
    return this.tenantMappings.find(t => t.id === tenantId) || null;
  }

  /**
   * Agrega un nuevo mapeo de tenant (para configuración dinámica)
   * @param tenantInfo - Información del nuevo tenant
   */
  addTenantMapping(tenantInfo: TenantInfo): void {
    const exists = this.tenantMappings.some(t => t.id === tenantInfo.id);
    if (!exists) {
      this.tenantMappings.push(tenantInfo);
      console.log(`New tenant mapping added: ${tenantInfo.id}`);
    }
  }

  /**
   * Método de debugging para ver mappings actuales
   */
  debugMappings(): void {
    console.table(this.tenantMappings.map(t => ({
      ID: t.id,
      Name: t.name,
      Domain: t.domain,
      EmailDomains: t.emailDomains.join(', ')
    })));
  }
}

// Instancia singleton del servicio
export const tenantDetectionService = new TenantDetectionService();