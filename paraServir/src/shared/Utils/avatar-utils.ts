/**
 * Utilidades para generar avatares aleatorios para usuarios
 * Usa APIs públicas que generan avatares determinísticos basados en un ID
 */

/**
 * Genera un avatar aleatorio pero determinístico basado en un ID
 * El mismo ID siempre generará el mismo avatar
 * 
 * Opciones de APIs:
 * 1. DiceBear - Avatares estilizados (recomendado)
 * 2. UI Avatars - Avatares con iniciales
 * 3. Pravatar - Avatares aleatorios
 */
export function getRandomAvatar(userId: string, name?: string): string {
  if (!userId) {
    return getDefaultAvatar();
  }

  // Usar DiceBear para avatares determinísticos y profesionales
  // El mismo userId siempre generará el mismo avatar
  const seed = userId.replace(/-/g, '').substring(0, 10);
  
  // Estilo "personas" de DiceBear - genera avatares realistas
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

/**
 * Genera un avatar con iniciales usando UI Avatars
 */
export function getAvatarWithInitials(name: string, size: number = 200): string {
  if (!name) {
    return getDefaultAvatar();
  }

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Generar color de fondo basado en el nombre (determinístico)
  const colors = [
    '6F6AE8', // Primary color
    '4DA3FF', // Accent color
    '2FB8A8', // Success color
    'F4B740', // Warning color
    'E06262', // Destructive color
  ];
  const colorIndex = name.length % colors.length;
  const bgColor = colors[colorIndex];

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${bgColor}&color=ffffff&bold=true&font-size=0.5`;
}

/**
 * Genera un avatar usando Pravatar (avatars aleatorios pero determinísticos)
 */
export function getPravatarAvatar(userId: string, size: number = 200): string {
  if (!userId) {
    return getDefaultAvatar();
  }

  // Convertir userId a número para usar como seed
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return `https://i.pravatar.cc/${size}?img=${seed % 70 + 1}`;
}

/**
 * Obtiene el mejor avatar disponible para un usuario
 * Prioriza: avatar_url del backend > avatar generado > default
 */
export function getUserAvatar(
  userId: string,
  avatarUrl: string | null | undefined,
  name?: string
): string {
  // Si ya tiene avatar_url, usarlo
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  // Si tiene nombre, usar avatar con iniciales
  if (name) {
    return getAvatarWithInitials(name);
  }

  // Si no, usar avatar aleatorio basado en ID
  return getRandomAvatar(userId);
}

/**
 * Avatar por defecto si no se puede generar ninguno
 */
function getDefaultAvatar(): string {
  return `https://ui-avatars.com/api/?name=U&size=200&background=6F6AE8&color=ffffff&bold=true`;
}

/**
 * Genera un avatar para trabajador usando estilo profesional
 */
export function getWorkerAvatar(
  workerId: string,
  avatarUrl: string | null | undefined,
  firstName?: string,
  lastName?: string
): string {
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  if (fullName) {
    return getAvatarWithInitials(fullName);
  }

  return getRandomAvatar(workerId);
}
