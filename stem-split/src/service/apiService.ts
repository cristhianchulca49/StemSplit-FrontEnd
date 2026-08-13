import axios, { AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// TYPES & INTERFACES
// ---------------------------------------------------------------------------

export type TrackStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface TrackResponseDto {
  id: string;
  filename: string;
  status: TrackStatus;
}

export interface ApiErrorResponse {
  message: string;
  timestamp?: string;
  status?: number;
}

// ---------------------------------------------------------------------------
// AXIOS INSTANCE CONFIGURATION
// ---------------------------------------------------------------------------

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout para subidas de archivos
});

// ---------------------------------------------------------------------------
// API SERVICE METHODS
// ---------------------------------------------------------------------------

/**
 * Envía un archivo de audio al backend en Spring Boot para iniciar el proceso de ingesta.
 *
 * @param file - Archivo de audio seleccionado (MP3/WAV)
 * @param onUploadProgress - Callback opcional para monitorear el progreso de carga (0 - 100%)
 * @returns Promise<TrackResponseDto> - DTO retornado por el servidor (HTTP 201)
 */
export const uploadTrack = async (
  file: File,
  onUploadProgress?: (progressPercentage: number) => void
): Promise<TrackResponseDto> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<TrackResponseDto>('/tracks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });

    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Obtiene el estado actual de un track por su UUID.
 */
export const getTrackStatus = async (trackId: string): Promise<TrackResponseDto> => {
  try {
    const response = await apiClient.get<TrackResponseDto>(`/tracks/${trackId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// ---------------------------------------------------------------------------
// HELPER: GENERIC ERROR HANDLER
// ---------------------------------------------------------------------------

const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;

    if (axiosError.response) {
      // Error devuelto directamente por el backend (@RestControllerAdvice)
      const serverMessage = axiosError.response.data?.message;
      return new Error(serverMessage || `Server Error (${axiosError.response.status})`);
    }

    if (axiosError.request) {
      // La petición fue hecha pero no hubo respuesta (backend caído / problema de red)
      return new Error('Unable to connect to backend server. Please verify Spring Boot is running.');
    }
  }

  return new Error((error as Error).message || 'An unexpected error occurred during audio upload.');
};