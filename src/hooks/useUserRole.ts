import { useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user' | 'guest';

interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canUpload: boolean;
  canManageUsers: boolean;
}

const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canDownload: true,
    canUpload: true,
    canManageUsers: true,
  },
  user: {
    canView: true,
    canEdit: true,
    canDelete: true,
    canDownload: true,
    canUpload: true,
    canManageUsers: false,
  },
  guest: {
    canView: true,
    canEdit: false,
    canDelete: false,
    canDownload: false,
    canUpload: false,
    canManageUsers: false,
  },
};

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [permissions, setPermissions] = useState<UserPermissions>(rolePermissions.user);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for guest session
    const guestSession = localStorage.getItem('guest_session');
    const storedRole = localStorage.getItem('user_role') as UserRole || 'user';
    
    if (guestSession === 'true') {
      setUserRole('guest');
      setIsGuest(true);
      setPermissions(rolePermissions.guest);
    } else {
      setUserRole(storedRole);
      setIsGuest(false);
      setPermissions(rolePermissions[storedRole]);
    }
  }, []);

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return permissions[permission];
  };

  const isRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  const clearGuestSession = () => {
    localStorage.removeItem('guest_session');
    localStorage.removeItem('user_role');
    setIsGuest(false);
    setUserRole('user');
    setPermissions(rolePermissions.user);
  };

  return {
    userRole,
    permissions,
    isGuest,
    hasPermission,
    isRole,
    clearGuestSession,
  };
};