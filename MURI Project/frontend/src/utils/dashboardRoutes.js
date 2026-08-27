export const getDashboardPathForRole = (role) => {
  const normalizedRole = (role || '').toLowerCase();
  if (normalizedRole === 'admin') return '/admin-dashboard';
  if (normalizedRole === 'it') return '/it-dashboard';
  if (normalizedRole === 'virtual') return '/virtual-dashboard';
  return '/user-dashboard';
};
