import { useState } from "react";
import { updateUser } from "../Services/Settings.service.ts";
import { useSelector } from "react-redux";
import type { RootState } from "@/Store";
import axios from "axios";

export interface UpdateUserForm {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  phone: string;
  location?: string;
}

export function useProfileSettings() {
  const user = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (data: UpdateUserForm) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await updateUser(user.id, data);

      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Error al actualizar");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al actualizar");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    submit,
    loading,
    error,
    success,
    user,
  };
}
