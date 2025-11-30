export const verificationEmailTemplate = (verificationLink) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Correo Electrónico</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f2f5;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 18px rgba(0,0,0,0.06);
        }
        .email-header {
            background-color: #0A2540; /* Azul oscuro principal */
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .email-body {
            padding: 40px;
            line-height: 1.6;
            text-align: center;
        }
        .email-body p {
            font-size: 16px;
            margin: 0 0 25px;
        }
        .email-body .button {
            display: inline-block;
            background-color: #007bff; /* Azul brillante para el botón */
            color: #ffffff;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: bold;
            text-decoration: none;
            border-radius: 8px;
            transition: background-color 0.3s;
        }
        .email-footer {
            text-align: center;
            padding: 20px 40px;
            font-size: 12px;
            color: #888;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Bienvenido a ParaServir</h1>
        </div>
        <div class="email-body">
            <p>¡Gracias por registrarte! Por favor, haz clic en el botón de abajo para verificar tu dirección de correo electrónico y activar tu cuenta.</p>
            <a href="${verificationLink}" class="button">Verificar mi cuenta</a>
            <p style="margin-top: 30px; font-size: 14px; color: #555;">Si no te registraste en ParaServir, puedes ignorar este correo de forma segura.</p>
        </div>
        <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} ParaServir. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>`;
};