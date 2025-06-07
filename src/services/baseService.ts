import api from "./api";
import type { ApiResponse, apiError, QueryParams } from "@/types/api";
import type { AxiosResponse } from "axios";

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
      code?: string | number;
      errors?: Record<string, string[]>;
    };
    status?: number;
  };
  message?: string;
}

export class BaseService {
  protected async handleRequest<T>(
    request: Promise<AxiosResponse<ApiResponse<T> | T>>
  ): Promise<T> {
    try {
      const response = await request;

      if (
        response.data &&
        typeof response.data === "object" &&
        "data" in response.data
      ) {
        const apiResponse = response.data as ApiResponse<T>;
        if (!apiResponse.data) {
          throw new Error("No data received from server");
        }
        return apiResponse.data;
      }

      if (!response.data) {
        throw new Error("No data received from server");
      }

      return response.data as T;
    } catch (error: unknown) {
      const err = error as ErrorResponse;

      const standardError: apiError = {
        message:
          err.response?.data?.message || err.message || "An error occurred",
        code:
          typeof err.response?.data?.code === "number"
            ? err.response.data.code
            : err.response?.status || 500,
      };

      throw standardError;
    }
  }

  protected async get<T>(
    url: string,
    params?: QueryParams | Record<string, unknown>
  ): Promise<T> {
    return this.handleRequest<T>(api.get(url, { params }));
  }

  protected async post<T>(url: string, data?: unknown): Promise<T> {
    return this.handleRequest<T>(api.post(url, data));
  }

  protected async put<T>(url: string, data?: unknown): Promise<T> {
    return this.handleRequest<T>(api.put(url, data));
  }

  protected async delete<T>(url: string): Promise<T> {
    return this.handleRequest<T>(api.delete(url));
  }
}
