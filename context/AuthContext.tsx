import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, UserSettings } from "@/constants/types";
import { storage, generateId, formatDate } from "@/utils/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, name: string, role: UserRole, language: "en" | "bn") => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultSettings: UserSettings = {
  attendanceColor: "#4CAF50",
  soundEnabled: true,
  hapticEnabled: true,
  darkMode: "system",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await storage.getUser();
      setUser(savedUser);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, name: string, role: UserRole, language: "en" | "bn") => {
    const newUser: User = {
      id: generateId(),
      phone,
      name,
      role,
      language,
      createdAt: formatDate(new Date()),
      settings: defaultSettings,
    };
    await storage.setUser(newUser);
    setUser(newUser);
  };

  const logout = async () => {
    await storage.clearAllData();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await storage.setUser(updatedUser);
    setUser(updatedUser);
  };

  const updateSettings = async (settings: Partial<UserSettings>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      settings: { ...user.settings, ...settings },
    };
    await storage.setUser(updatedUser);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
