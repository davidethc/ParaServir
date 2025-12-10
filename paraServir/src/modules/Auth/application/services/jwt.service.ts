export interface JwtService {
    sign(payload: { id: string; email: string; role: string }): string;
    verify(token: string): { id: string; email: string; role: string };
}

export class JwtServiceImpl implements JwtService {
    constructor(secret: string = 'your-secret-key') {
        // Nota: secret se recibirá pero no se guarda porque actualmente usamos btoa/atob como placeholder
        // Cuando se implemente jwt real con jsonwebtoken, se guardará: this.secret = secret;
        void secret; // Marcar como usado intencionalmente para evitar warning
    }

    sign(payload: { id: string; email: string; role: string }): string {
        // En producción, usarías jsonwebtoken o jose
        // return jwt.sign(payload, this._secret, { expiresIn: '24h' });
        
        // Placeholder para desarrollo
        const token = btoa(JSON.stringify(payload));
        return token;
    }

    verify(token: string): { id: string; email: string; role: string } {
        // En producción, usarías jwt.verify()
        // return jwt.verify(token, this._secret) as { id: string; email: string; role: string };
        
        // Placeholder para desarrollo
        try {
            const payload = JSON.parse(atob(token));
            return payload;
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

