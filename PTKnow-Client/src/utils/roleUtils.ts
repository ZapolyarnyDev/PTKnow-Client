export const normalizeRole = (role?: string | null) => {
  if (!role) {
    return '';
  }
  const upper = role.toUpperCase().trim();
  return upper.startsWith('ROLE_') ? upper.slice(5) : upper;
};
