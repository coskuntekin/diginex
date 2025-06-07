import { ref, type Ref } from "vue";
import type { ApiError, ApiResponse, apiError } from "@/types/api";

export function useApiState<T = unknown>() {
  const data: Ref<T | null> = ref(null);
  const loading = ref(false);
  const error: Ref<ApiError | null> = ref(null);

  const setLoading = (value: boolean) => {
    loading.value = value;
    if (value) {
      error.value = null;
    }
  };

  const setData = (value: T) => {
    data.value = value;
    error.value = null;
  };

  const setError = (err: ApiError | apiError) => {
    if ("status" in err) {
      error.value = err as ApiError;
    } else {
      error.value = {
        message: err.message,
        status: err.code,
      } as ApiError;
    }
    loading.value = false;
  };

  const reset = () => {
    data.value = null;
    loading.value = false;
    error.value = null;
  };

  return {
    data,
    loading,
    error,
    setLoading,
    setData,
    setError,
    reset,
  };
}

export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  state?: ReturnType<typeof useApiState<T>>
): Promise<T | null> {
  try {
    if (state) {
      state.setLoading(true);
    }

    const result = await operation();

    if (state) {
      state.setData(result);
    }

    return result;
  } catch (err: unknown) {
    const error = err as apiError & {
      message?: string;
      status?: number;
      code?: string | number;
      data?: unknown;
      errors?: Record<string, string[]>;
    };

    const standardError: apiError = {
      message: error.message || "An error occurred",
      code: typeof error.code === "number" ? error.code : error.status || 500,
    };

    const apiError: ApiError = {
      message: standardError.message,
      status: error.status || 500,
      code: error.code ? error.code.toString() : undefined,
      data: error.data,
      errors: error.errors,
    };

    if (state) {
      state.setError(apiError);
    }

    console.error("API Operation Error:", standardError);
    return null;
  } finally {
    if (state) {
      state.setLoading(false);
    }
  }
}

export const apiHelpers = {
  formatApiResponse(response: { data: unknown; status: number }): ApiResponse {
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  },

  formatApiError(error: {
    response?: { data?: { message?: string }; status?: number };
    message?: string;
  }): ApiResponse {
    return {
      success: false,
      data: null,
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status || 500,
    };
  },

  buildApiUrl(path: string, params?: Record<string, unknown>): string {
    if (!params) return path;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  },
};
