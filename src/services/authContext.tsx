import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import { storage } from './storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    community_id?: string;
    apartment_name: string;
    apartment_address: string;
    flat_id?: string;
    flat_number?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'communityhub_auth_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Sync users list and session
  const refreshUsers = useCallback(() => {
    const users = storage.getUsers();
    setAllUsers(users);

    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    if (savedUserId) {
      const user = users.find((u) => u.id === savedUserId);
      if (user && user.is_active) {
        setCurrentUser(user);
        return;
      }
    }

    // If no active session, leave unauthenticated so Landing Page with Sign In is rendered
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    refreshUsers();
    const unsubscribe = storage.subscribe(refreshUsers);
    return () => unsubscribe();
  }, [refreshUsers]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const users = storage.getUsers();
    let cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === 'admin@smartnest.com') {
      cleanEmail = 'admin@communityhub.com';
    }
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!user.is_active) {
      return { success: false, error: 'Account has been deactivated by the community administrator.' };
    }

    if (password && password !== 'password123') {
      return { success: false, error: 'Invalid email or password.' };
    }

    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, user.id);
    return { success: true };
  };

  const loginAsRole = (role: UserRole) => {
    const users = storage.getUsers();
    const user = users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, user.id);
    }
  };

  const switchUser = (userId: string) => {
    const users = storage.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, user.id);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    community_id?: string;
    apartment_name: string;
    apartment_address: string;
    flat_id?: string;
    flat_number?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const users = storage.getUsers();
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    let communityId = data.community_id;
    let apartmentName = data.apartment_name?.trim();
    let apartmentAddress = data.apartment_address?.trim();

    if (!communityId) {
      const communities = storage.getCommunities();
      const existingComm = communities.find(
        (c) => c.name.toLowerCase() === apartmentName.toLowerCase()
      );
      if (existingComm) {
        communityId = existingComm.id;
        apartmentName = existingComm.name;
        apartmentAddress = existingComm.address;
      } else {
        const newComm = storage.createCommunity({
          name: apartmentName,
          address: apartmentAddress || 'Address on record',
          city: 'Bengaluru',
          state: 'Karnataka',
          country: 'India',
          postal_code: '560001',
        });
        communityId = newComm.id;
        apartmentName = newComm.name;
        apartmentAddress = newComm.address;
      }
    }

    const newUser = storage.createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      is_active: true,
      community_id: communityId,
      apartment_name: apartmentName,
      apartment_address: apartmentAddress,
      flat_id: data.flat_id,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
    });

    if (data.flat_id && data.role === 'TENANT') {
      storage.assignTenant(data.flat_id, newUser.id);
    } else if (data.flat_id && data.role === 'OWNER') {
      storage.assignOwner(data.flat_id, newUser.id);
    }

    setCurrentUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, newUser.id);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = storage.updateUser(currentUser.id, updates);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginAsRole,
        switchUser,
        register,
        logout,
        updateProfile,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
