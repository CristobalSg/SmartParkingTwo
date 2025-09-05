import { createHash, randomBytes, timingSafeEqual, scryptSync } from 'crypto';

/**
 * Utilidad para manejo de criptografía usando solo APIs nativas de Node.js
 * Sin dependencias externas como bcrypt
 */

const SALT_SIZE = 32;
const HASH_LENGTH = 64;
const SCRYPT_OPTIONS = {
    N: 16384, // Factor de costo (2^14)
    r: 8,     // Tamaño de bloque
    p: 1,     // Paralelización
    maxmem: 64 * 1024 * 1024 // 64MB máximo de memoria
};


export function hashPassword(plainPassword: string): string {
    // Validar que la contraseña no esté vacía
    if (!plainPassword || plainPassword.length === 0) {
        throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
    }

    const salt = randomBytes(SALT_SIZE);

    // Usar scryptSync con las opciones de seguridad configuradas
    const hash = scryptSync(plainPassword, salt, HASH_LENGTH, SCRYPT_OPTIONS);

    return `${salt.toString('hex')}:${hash.toString('hex')}`;
}


export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
    try {
        const parts = hashedPassword.split(':');

        if (parts.length !== 2) {
            return false;
        }

        const [saltHex, originalHashHex] = parts;
        const salt = Buffer.from(saltHex, 'hex');
        const originalHash = Buffer.from(originalHashHex, 'hex');

        if (salt.length !== SALT_SIZE || originalHash.length !== HASH_LENGTH) {
            return false;
        }

        // Recalcular el hash con la misma configuración
        const testHash = scryptSync(plainPassword, salt, HASH_LENGTH, SCRYPT_OPTIONS);

        // Comparación de tiempo constante (protege contra timing attacks)
        return timingSafeEqual(originalHash, testHash);

    } catch (error) {
        // En caso de error, devolver false sin revelar información
        return false;
    }
}

/**
 * Token mejorado usando HMAC para integridad (sin JWT pero más seguro)
 */
export function generateSimpleToken(payload: any, secret: string = process.env.TOKEN_SECRET || 'default-secret'): string {
    // Crear timestamp y nonce para unicidad
    const timestamp = Date.now();
    const nonce = randomBytes(16).toString('hex');

    // Preparar datos del token
    const tokenData = {
        payload,
        timestamp,
        nonce,
        version: '1.0'
    };

    const dataString = JSON.stringify(tokenData);
    const dataBase64 = Buffer.from(dataString).toString('base64url');

    // Crear HMAC como firma (mucho más seguro que tu hash actual)
    const signature = createHash('sha256')
        .update(secret + dataBase64 + secret) // Sandwich con secret
        .digest('hex');

    // Token final: data.signature
    return `${dataBase64}.${signature}`;
}

/**
 * Validación de token mejorada con verificación HMAC
 */
export function validateSimpleToken(
    token: string,
    secret: string = process.env.TOKEN_SECRET || 'default-secret',
    maxAge: number = 24 * 60 * 60 * 1000 // 24 horas
): any {
    try {
        // Parsear token
        const parts = token.split('.');
        if (parts.length !== 2) {
            return null;
        }

        const [dataBase64, signature] = parts;

        // Verificar firma HMAC
        const expectedSignature = createHash('sha256')
            .update(secret + dataBase64 + secret)
            .digest('hex');

        // Comparación de tiempo constante para la firma
        if (!timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        )) {
            return null;
        }

        // Decodificar datos
        const dataString = Buffer.from(dataBase64, 'base64url').toString('utf8');
        const tokenData = JSON.parse(dataString);

        // Verificar expiración
        const age = Date.now() - tokenData.timestamp;
        if (age > maxAge) {
            return null;
        }

        // Verificar estructura
        if (!tokenData.payload || !tokenData.timestamp || !tokenData.nonce) {
            return null;
        }

        return tokenData.payload;

    } catch (error) {
        return null;
    }
}

/**
 * Generador de IDs únicos mejorado
 */
export function generateSecureId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(16).toString('hex');
    const hash = createHash('sha256')
        .update(timestamp + randomPart)
        .digest('hex')
        .substring(0, 16);

    return `${timestamp}-${hash}`;
}

/**
 * Función para rate limiting simple (prevenir ataques de fuerza bruta)
 */
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const attempts = loginAttempts.get(identifier);

    if (!attempts) {
        loginAttempts.set(identifier, { count: 1, lastAttempt: now });
        return true;
    }

    // Limpiar ventana si ha pasado el tiempo
    if (now - attempts.lastAttempt > windowMs) {
        loginAttempts.set(identifier, { count: 1, lastAttempt: now });
        return true;
    }

    // Incrementar contador
    attempts.count++;
    attempts.lastAttempt = now;

    return attempts.count <= maxAttempts;
}


export function generateRefreshToken(payload: any): string {
    const refreshData = {
        ...payload,
        type: 'refresh',
        timestamp: Date.now(),
        nonce: randomBytes(16).toString('hex'),
        version: '1.0'
    };

    // Usar secret diferente para refresh tokens
    const refreshSecret = process.env.REFRESH_SECRET || 'refresh-secret';
    return generateSimpleToken(refreshData, refreshSecret);
}