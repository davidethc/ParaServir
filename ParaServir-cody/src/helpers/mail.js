import { Resend } from "resend";
import dotenv from "dotenv";
import { verificationEmailTemplate } from "../../templates/verificationTemplate.js";

dotenv.config();

// Inicializar cliente de Resend solo si existe la API key
let resend = null;
if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
} else {
    console.warn("⚠️  RESEND_API_KEY no configurada. Los emails de verificación no se enviarán.");
}

export async function sendVerificationEmail(direction, verificationLink) {
    // Si no hay API key configurada, solo loguear el link (modo desarrollo)
    if (!resend || !process.env.RESEND_API_KEY) {
        console.log("📧 [MODO DESARROLLO] Email de verificación no enviado (RESEND_API_KEY no configurada)");
        console.log("🔗 Link de verificación:", verificationLink);
        console.log("📬 Email destinatario:", direction);
        return { 
            id: "dev-mode",
            message: "Email no enviado - RESEND_API_KEY no configurada"
        };
    }

    try {
        const response = await resend.emails.send({
            from: "ParaServir <noreply@monkyd.com>",
            to: direction,
            subject: "Verificación de cuenta",
            html: verificationEmailTemplate(verificationLink)
        });

        return response;
    } catch (error) {
        console.error("Problemas al enviar el correo de verificación:", error);
        throw new Error(
            "Error al enviar el correo de verificación: " +
            (error?.message || String(error))
        );
    }
}
