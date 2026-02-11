import { useState, useCallback } from "react";
import { authApi, getErrorMessage } from "@/api/auth";
import type { User } from "@/types/auth";
import type { SignUpFormData, SignInFormData } from "@/lib/schemas";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const getUser = useCallback((): User | null => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = useCallback((): boolean => {
    return !!localStorage.getItem("accessToken");
  }, []);

  const signUp = useCallback(
    async (data: SignUpFormData): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await authApi.signUp(data);
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (data: SignInFormData): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      try {
        const response = await authApi.signIn(data);
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("user", JSON.stringify(response.user));
        return { success: true };
      } catch (err) {
        return { success: false, error: getErrorMessage(err) };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // signOut to call backend
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsLoading(false);
    }
  }, []);

  // signOutAll
  const signOutAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logoutAll();
    } catch (err) {
      console.error("Logout all error:", err);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setIsLoading(false);
    }
  }, []);

  return { isLoading, signUp, signIn, signOut, signOutAll, isAuthenticated, getUser };
}