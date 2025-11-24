import { useState, useEffect } from "react";
import { workerApiService, type WorkerProfileResponse } from "../services/workerApiService";

interface UseWorkerProfileReturn {
  profile: WorkerProfileResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useWorkerProfile(userId: string | null): UseWorkerProfileReturn {
  const [profile, setProfile] = useState<WorkerProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await workerApiService.getProfileByUserId(userId);
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener perfil de trabajador";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
  };
}

