import { TenantContext } from "@/infrastructure/context/TenantContext";
import { AdminRepository } from "@/core/domain/repositories/AdminRepository";
import { AdminOutput } from "@/application/interfaces/AdminInterfaces";
import { Admin } from "@/core/domain/entities/Admin";

export class GetAdminByIdUseCase {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly tenantContext: TenantContext
    ) { }

    async execute(adminId: string): Promise<AdminOutput> {

        const tenant = this.tenantContext.requireTenant();


        if (!adminId || adminId.trim().length === 0) {
            throw new Error('Admin ID is required');
        }

        // Buscar admin por ID en el tenant
        const admin = await this.adminRepository.findById(adminId, tenant.id);


        if (!admin) {
            throw new Error('Administrator not found');
        }

        return this.mapToAdminOutput(admin);
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