import { useAuthStore } from '@/store/authStore';

/**
 * Hook para verificar se o usuário logado é admin
 * @returns true se o usuário é admin, false caso contrário
 */
export const useIsAdmin = (): boolean => {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'admin';
};

/**
 * Função helper para verificar se um usuário é admin
 * @param user - Objeto do usuário
 * @returns true se o usuário é admin
 */
export const isAdmin = (user: { role: string } | null | undefined): boolean => {
  return user?.role === 'admin';
};

/**
 * Função helper para verificar se um usuário é student
 * @param user - Objeto do usuário
 * @returns true se o usuário é student
 */
export const isStudent = (user: { role: string } | null | undefined): boolean => {
  return user?.role === 'student';
};
