// Application layer interfaces - Framework agnostic
export interface CreateAdminInput {
    tenantUuid?: string; // UUID del tenant al que pertenece el administrador (opcional si se usa contexto)
    email: string;
    password: string;
    name: string;
}

export interface UpdateAdminInput {
    email?: string;
    name?: string;
    // tenantId NO se puede cambiar
    // passwordHash se maneja por separado por seguridad
}

export interface ChangeAdminPasswordInput {
    currentPassword: string;
    newPassword: string;
}

export interface ResetAdminPasswordInput {
    email: string;
    tenantUuid: string;
}

export interface AdminOutput {
    id: string;
    tenantUuid: string; // UUID del tenant
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    // passwordHash NO se expone nunca
}

export interface AdminLoginInput {
    email: string;
    password: string;
    tenantUuid?: string; // Opcional si se infiere del dominio
}

export interface AdminAuthOutput {
    admin: AdminOutput;
    authentication: TokenResponse;
    session?: {
        session_id: string;
        login_time: string;
        ip_address?: string;
    };
}

// Interfaces para gestión de tenants (solo para super admin)
export interface CreateTenantInput {
    tenantId: string; // Identificador único (empresa-a, ciudad-b)
    name: string; // Nombre completo
    domain: string; // Subdominio
    settings?: TenantSettingsInput;
}

export interface UpdateTenantInput {
    name?: string;
    domain?: string;
    isActive?: boolean;
    settings?: TenantSettingsInput;
    // tenantId NO se puede cambiar
}

export interface TenantSettingsInput {
    maxUsers?: number;
    maxParkingSpaces?: number;
    allowedFeatures: string[];
    customBranding?: {
        logo?: string;
        colors?: {
            primary: string;
            secondary: string;
        };
    };
    timeZone?: string;
    currency?: string;
}

export interface TenantOutput {
    id: string; // UUID del registro
    tenantId: string; // Identificador único del tenant
    name: string;
    domain: string;
    isActive: boolean;
    settings?: TenantSettingsInput;
    createdAt: Date;
    updatedAt: Date;
}

// Interfaces para estadísticas y dashboard del administrador
export interface AdminDashboardData {
    tenantInfo: TenantOutput;
    stats: {
        totalUsers: number;
        totalParkingZones: number;
        totalParkingSpaces: number;
        activeReservations: number;
        occupancyRate: number; // Porcentaje de ocupación
    };
    recentActivity: {
        newUsersThisWeek: number;
        reservationsToday: number;
        mostUsedZones: Array<{
            zoneId: string;
            zoneName: string;
            reservationCount: number;
        }>;
    };
}

// Interfaces para gestión de zonas de estacionamiento
export interface CreateParkingZoneInput {
    tenantUuid: string;
    name: string;
    description?: string;
    capacity: number;
}

export interface UpdateParkingZoneInput {
    name?: string;
    description?: string;
    capacity?: number;
    // tenantId NO se puede cambiar
}

export interface ParkingZoneOutput {
    id: string;
    tenantUuid: string;
    name: string;
    description?: string;
    capacity: number;
    createdAt: Date;
    currentOccupancy?: number; // Espacios ocupados actualmente
    availableSpaces?: number; // Espacios disponibles
}

// Interfaces para gestión de espacios de estacionamiento
export interface CreateParkingSpaceInput {
    zoneId: string;
    spaceNumber: string;
    specialType: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
    isActive?: boolean;
}

export interface UpdateParkingSpaceInput {
    spaceNumber?: string;
    specialType?: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
    isActive?: boolean;
    // zoneId NO se puede cambiar
}

export interface ParkingSpaceOutput {
    id: string;
    zoneId: string;
    spaceNumber: string;
    specialType: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
    isActive: boolean;
    createdAt: Date;
    isOccupied?: boolean; // Si está actualmente ocupado
    currentReservation?: {
        id: string;
        userId: string;
        userName: string;
        reservedFrom: Date;
        reservedUntil: Date;
        status: string;
    };
}

// Interfaces para gestión de reservas (vista del administrador)
export interface ReservationOutput {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    parkingSpaceId: string;
    parkingSpaceNumber: string;
    parkingZoneName: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';
    reservedFrom: Date;
    reservedUntil: Date;
    specialNeeds: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
    createdAt: Date;
    updatedAt: Date;
}

export interface UpdateReservationStatusInput {
    status: 'confirmed' | 'cancelled' | 'expired';
    reason?: string; // Razón del cambio de estado
}

// Filtros para consultas del administrador
export interface AdminUserFilters {
    tenantUuid?: string;
    email?: string;
    emailVerified?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface AdminReservationFilters {
    tenantUuid?: string;
    userId?: string;
    parkingZoneId?: string;
    status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';
    dateFrom?: Date;
    dateTo?: Date;
    specialNeeds?: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
}

export interface AdminParkingFilters {
    tenantUuid?: string;
    zoneId?: string;
    specialType?: 'regular' | 'disabled' | 'pregnant' | 'electric' | 'visitor';
    isActive?: boolean;
    isOccupied?: boolean;
}


export interface TokenResponse {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    expires_at: string;
    scope: string;
    refresh_token?: string;

}