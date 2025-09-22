import { TenantContext } from "@/infrastructure/context/TenantContext";
import { AdminRepository } from "@/core/domain/repositories/AdminRepository";
import { AdminOutput } from "@/application/interfaces/AdminInterfaces";
import { Admin } from "@/core/domain/entities/Admin";

export class GetAllAdminsUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }
    async execute(): Promise<AdminOutput[]> {
        // Validar que el tenant exista y esté activo
        const tenant = this.tenantContext.requireTenant();

        // Obtener todos los admins del tenant
        const admins = await this.adminRepository.findAll(tenant.id);

        return admins.map(admin => this.mapToAdminOutput(admin));
    }

    private mapToAdminOutput(admin: Admin): AdminOutput {
        return {
            id: admin.id,
            tenantUuid: admin.tenantId,
            email: admin.email,
            name: admin.name,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
        };
    }
}