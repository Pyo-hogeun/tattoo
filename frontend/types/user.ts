export interface ManagedUser {
  id: string;
  nickname?: string;
  loginId: string | null;
  kakaoId: string | null;
  role: 'master' | 'admin' | 'manager';
  shop?: { _id: string; name: string; address?: string; phone?: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
