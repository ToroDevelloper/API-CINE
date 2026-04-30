import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface User {
  id: string;
  nombre: string;
  email: string;
  // TODO: Agregar más campos según necesites
  // role?: "admin" | "user";
  // createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (nombre: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Restaurar sesión desde localStorage al montar el componente
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("cine_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("cine_user");
      }
    }
    setIsLoading(false);
  }, []);

  /**
   * Login - Autenticar usuario
   * TODO: Conectar con API real
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Validación básica
      if (!email || !password) {
        return false;
      }

      // Mock para demostración
      const mockUser: User = { 
        id: "1", 
        nombre: "Usuario Cine", 
        email 
      };
      
      setUser(mockUser);
      localStorage.setItem("cine_user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout - Cerrar sesión
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("cine_user");
  };

  /**
   * Register - Registrar nuevo usuario
   * TODO: Conectar con API real
   */
  const register = async (
    nombre: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!nombre || !email || !password) {
        return false;
      }

      // Mock para demostración
      const mockUser: User = { 
        id: "1", 
        nombre, 
        email 
      };
      
      setUser(mockUser);
      localStorage.setItem("cine_user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Register error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login, 
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * @throws Error si se usa fuera de AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
