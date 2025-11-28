import { Resend } from "resend";
import dotenv from "dotenv";
import { verificationEmailTemplate } from "../../templates/verificationTemplate.js";

dotenv.config();

// Inicializar cliente de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(direction, verificationLink) {
    try {
        const response = await resend.emails.send({
            from: "ParaServir <onboarding@resend.dev>",
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
