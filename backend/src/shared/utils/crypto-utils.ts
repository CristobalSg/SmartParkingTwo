import { createHash, randomBytes } from 'crypto';

/**
 * Utilidad para manejo de criptografía usando solo APIs nativas de Node.js
 * Sin dependencias externas como bcrypt
 */

/**
 * Genera un hash SHA-256 de una contraseña con salt
 * @param plainPassword - Contraseña en texto plano
 * @param salt - Salt opcional, si no se proporciona se genera uno
 * @returns Hash de la contraseña con el salt incluido
 */
export function hashPassword(plainPassword: string, salt?: string): string {
    // Validar que la contraseña no esté vacía
    if (!plainPassword || plainPassword.length === 0) {
        throw new Error('Password cannot be empty');
    }

    // Generar salt si no se proporciona
    if (!salt) {
        salt = randomBytes(16).toString('hex'); // 32 caracteres hex
    }

    // Crear hash SHA-256 de contraseña + salt
    const hash = createHash('sha256')
        .update(plainPassword + salt)
        .digest('hex');

    // Retornar salt:hash para poder verificar después
    return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña coincide con un hash
 * @param plainPassword - Contraseña en texto plano
 * @param hashedPassword - Hash almacenado (formato: salt:hash)
 * @returns true si la contraseña es correcta
 */
export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    try {
        // Dividir el hash almacenado en salt y hash
        const [salt, originalHash] = hashedPassword.split(':');

        if (!salt || !originalHash) {
            return false;
        }

        // Crear hash de la contraseña proporcionada con el mismo salt
        const testHash = createHash('sha256')
            .update(plainPassword + salt)
            .digest('hex');

        // Comparar los hashes
        return testHash === originalHash;
    } catch (error) {
        return false;
    }
}

/**
 * Genera un token simple para autenticación
 * @param payload - Datos a incluir en el token
 * @returns Token generado
 */
export function generateSimpleToken(payload: any): string {
    // Crear un timestamp
    const timestamp = Date.now();

    // Generar un número aleatorio para mayor unicidad
    const randomValue = Math.random().toString(36).substring(2);

    // Combinar payload con timestamp y valor aleatorio
    const tokenData = {
        ...payload,
        timestamp,
        random: randomValue
    };

    // Crear hash SHA-256 del token data como "firma"
    const signature = createHash('sha256')
        .update(JSON.stringify(tokenData))
        .digest('hex');

    // Crear el token final: datos + firma
    const token = {
        data: tokenData,
        signature
    };

    // Convertir a string (sin usar base64)
    return JSON.stringify(token);
}

/**
 * Valida un token simple
 * @param token - Token a validar
 * @param maxAge - Edad máxima del token en milisegundos (default: 24 horas)
 * @returns Datos del token si es válido, null si no
 */
export function validateSimpleToken(token: string, maxAge: number = 24 * 60 * 60 * 1000): any {
    try {
        // Parsear el token
        const tokenObj = JSON.parse(token);

        if (!tokenObj.data || !tokenObj.signature) {
            return null;
        }

        // Verificar la firma
        const expectedSignature = createHash('sha256')
            .update(JSON.stringify(tokenObj.data))
            .digest('hex');

        if (expectedSignature !== tokenObj.signature) {
            return null;
        }

        // Verificar que no esté expirado
        const tokenAge = Date.now() - tokenObj.data.timestamp;
        if (tokenAge > maxAge) {
            return null;
        }

        // Retornar los datos del token
        return tokenObj.data;
    } catch (error) {
        return null;
    }
}

/**
 * Genera un ID único simple
 * @returns ID único basado en timestamp y valores aleatorios
 */
export function generateSimpleId(): string {
    const timestamp = Date.now().toString(36);
    const randomValue = Math.random().toString(36).substring(2);
    return `${timestamp}-${randomValue}`;
}
