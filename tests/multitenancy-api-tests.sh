#!/bin/bash

# =======================================================
# PRUEBAS DE API MULTI-TENANCY - SMART PARKING
# =======================================================
# Ejecutar desde la carpeta tests: ./multitenancy-api-tests.sh
# O ejecutar pruebas individuales: ./multitenancy-api-tests.sh <numero>

BASE_URL="http://localhost:3000"
TENANT_UNIVERSIDAD="universidad-nacional"
TENANT_EMPRESA="empresa-tech"
TENANT_HOSPITAL="hospital-central"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 INICIANDO PRUEBAS DE API MULTI-TENANCY${NC}"
echo "================================================="

# Función para ejecutar prueba
run_test() {
    local test_num=$1
    local description=$2
    local curl_cmd=$3
    
    echo -e "\n${YELLOW}TEST $test_num: $description${NC}"
    echo "Command: $curl_cmd"
    echo "Response:"
    eval $curl_cmd
    echo -e "\n${GREEN}✓ Test $test_num completed${NC}"
    echo "---"
}

# Si se pasa un número de prueba específico
if [ $# -eq 1 ]; then
    case $1 in
        1|2|3|4|5|6|7|8|9|10|11|12|13|14|15)
            echo "Ejecutando prueba específica: $1"
            ;;
        *)
            echo "Número de prueba inválido. Use 1-15"
            exit 1
            ;;
    esac
fi

# =======================================================
# PRUEBAS DE CREACIÓN DE USUARIOS
# =======================================================

if [ -z "$1" ] || [ "$1" = "1" ]; then
run_test 1 "Crear usuario en Universidad Nacional" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: ${TENANT_UNIVERSIDAD}' \
  -d '{
    \"email\": \"nuevo.estudiante@universidad.edu\",
    \"name\": \"Estudiante Nuevo\"
  }'"
fi

if [ -z "$1" ] || [ "$1" = "2" ]; then
run_test 2 "Crear usuario en Empresa Tech" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: ${TENANT_EMPRESA}' \
  -d '{
    \"email\": \"nuevo.developer@techsolutions.com\",
    \"name\": \"Developer Nuevo\"
  }'"
fi

if [ -z "$1" ] || [ "$1" = "3" ]; then
run_test 3 "Crear usuario en Hospital Central" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: ${TENANT_HOSPITAL}' \
  -d '{
    \"email\": \"enfermero@hospital-central.gov\",
    \"name\": \"Enfermero Nuevo\"
  }'"
fi

# =======================================================
# PRUEBAS DE LISTADO (VERIFICAR AISLAMIENTO)
# =======================================================

if [ -z "$1" ] || [ "$1" = "4" ]; then
run_test 4 "Listar usuarios de Universidad Nacional" \
"curl -H 'X-Tenant-ID: ${TENANT_UNIVERSIDAD}' ${BASE_URL}/api/users"
fi

if [ -z "$1" ] || [ "$1" = "5" ]; then
run_test 5 "Listar usuarios de Empresa Tech" \
"curl -H 'X-Tenant-ID: ${TENANT_EMPRESA}' ${BASE_URL}/api/users"
fi

if [ -z "$1" ] || [ "$1" = "6" ]; then
run_test 6 "Listar usuarios de Hospital Central" \
"curl -H 'X-Tenant-ID: ${TENANT_HOSPITAL}' ${BASE_URL}/api/users"
fi

# =======================================================
# PRUEBAS DE ERRORES (TENANT INVÁLIDO/FALTANTE)
# =======================================================

if [ -z "$1" ] || [ "$1" = "7" ]; then
run_test 7 "Error: Crear usuario sin tenant (debe fallar)" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -d '{
    \"email\": \"sin.tenant@test.com\",
    \"name\": \"Usuario Sin Tenant\"
  }'"
fi

if [ -z "$1" ] || [ "$1" = "8" ]; then
run_test 8 "Error: Crear usuario con tenant inexistente (debe fallar)" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: tenant-inexistente' \
  -d '{
    \"email\": \"usuario@inexistente.com\",
    \"name\": \"Usuario Inexistente\"
  }'"
fi

if [ -z "$1" ] || [ "$1" = "9" ]; then
run_test 9 "Error: Listar usuarios sin tenant (debe fallar)" \
"curl ${BASE_URL}/api/users"
fi

# =======================================================
# PRUEBAS DE EMAILS DUPLICADOS (MULTI-TENANCY)
# =======================================================

if [ -z "$1" ] || [ "$1" = "10" ]; then
run_test 10 "Error: Email duplicado en mismo tenant (debe fallar)" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: ${TENANT_UNIVERSIDAD}' \
  -d '{
    \"email\": \"carlos.rodriguez@estudiante.edu\",
    \"name\": \"Carlos Duplicado\"
  }'"
fi

if [ -z "$1" ] || [ "$1" = "11" ]; then
run_test 11 "OK: Mismo email en diferentes tenants (debe funcionar)" \
"curl -X POST ${BASE_URL}/api/users \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: ${TENANT_EMPRESA}' \
  -d '{
    \"email\": \"carlos.rodriguez@estudiante.edu\",
    \"name\": \"Carlos en Empresa\"
  }'"
fi

# =======================================================
# PRUEBAS DE OBTENER USUARIO POR ID
# =======================================================

if [ -z "$1" ] || [ "$1" = "12" ]; then
echo -e "\n${YELLOW}TEST 12: Obtener primer usuario de Universidad Nacional por ID${NC}"
echo "Primero obtenemos la lista para sacar un ID:"
USERS_RESPONSE=$(curl -s -H "X-Tenant-ID: ${TENANT_UNIVERSIDAD}" ${BASE_URL}/api/users)
USER_ID=$(echo $USERS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "ID encontrado: $USER_ID"

if [ -n "$USER_ID" ]; then
    run_test "12a" "Obtener usuario específico" \
    "curl -H 'X-Tenant-ID: ${TENANT_UNIVERSIDAD}' ${BASE_URL}/api/users/${USER_ID}"
else
    echo -e "${RED}❌ No se pudo extraer ID de usuario${NC}"
fi
fi

# =======================================================
# PRUEBAS DE ACTUALIZACIÓN
# =======================================================

if [ -z "$1" ] || [ "$1" = "13" ]; then
echo -e "\n${YELLOW}TEST 13: Actualizar usuario${NC}"
USERS_RESPONSE=$(curl -s -H "X-Tenant-ID: ${TENANT_UNIVERSIDAD}" ${BASE_URL}/api/users)
USER_ID=$(echo $USERS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$USER_ID" ]; then
    run_test "13a" "Actualizar nombre de usuario" \
    "curl -X PUT ${BASE_URL}/api/users/${USER_ID} \
      -H 'Content-Type: application/json' \
      -H 'X-Tenant-ID: ${TENANT_UNIVERSIDAD}' \
      -d '{
        \"name\": \"Nombre Actualizado\"
      }'"
else
    echo -e "${RED}❌ No se pudo extraer ID de usuario${NC}"
fi
fi

# =======================================================
# PRUEBAS DE VALIDACIÓN CROSS-TENANT
# =======================================================

if [ -z "$1" ] || [ "$1" = "14" ]; then
echo -e "\n${YELLOW}TEST 14: Error Cross-Tenant (acceder a usuario de otro tenant)${NC}"
echo "Obtenemos un usuario del tenant Universidad:"
USERS_UNI=$(curl -s -H "X-Tenant-ID: ${TENANT_UNIVERSIDAD}" ${BASE_URL}/api/users)
USER_ID_UNI=$(echo $USERS_UNI | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$USER_ID_UNI" ]; then
    run_test "14a" "Intentar acceder con tenant diferente (debe fallar/no encontrar)" \
    "curl -H 'X-Tenant-ID: ${TENANT_EMPRESA}' ${BASE_URL}/api/users/${USER_ID_UNI}"
else
    echo -e "${RED}❌ No se pudo extraer ID de usuario${NC}"
fi
fi

# =======================================================
# PRUEBA DE HEALTH CHECK (SIN TENANT)
# =======================================================

if [ -z "$1" ] || [ "$1" = "15" ]; then
run_test 15 "Health check (ruta pública, sin tenant)" \
"curl ${BASE_URL}/health || curl ${BASE_URL}/api/health"
fi

echo -e "\n${GREEN}🎉 TODAS LAS PRUEBAS COMPLETADAS${NC}"
echo "================================================="
echo -e "${BLUE}📝 RESUMEN:${NC}"
echo "- Pruebas 1-3: Creación de usuarios en diferentes tenants"
echo "- Pruebas 4-6: Verificación de aislamiento por tenant"
echo "- Pruebas 7-9: Validaciones de errores (tenant faltante/inválido)"
echo "- Pruebas 10-11: Validación de emails únicos por tenant"
echo "- Pruebas 12-13: Operaciones CRUD por ID"
echo "- Prueba 14: Validación cross-tenant"
echo "- Prueba 15: Rutas públicas"
echo ""
echo -e "${YELLOW}Para ejecutar prueba específica: ./multitenancy-api-tests.sh <numero>${NC}"
echo -e "${YELLOW}Para ejecutar todas: ./multitenancy-api-tests.sh${NC}"
