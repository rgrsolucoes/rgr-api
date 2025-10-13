import { ApiResponse } from '../types';

export const createSuccessResponse = <T>(message: string, data?: T): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
    message
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};

export const createErrorResponse = (message: string, errors?: string[]): ApiResponse => {
  return {
    success: false,
    message,
    errors: errors || []
  };
};

export const createPaginatedResponse = <T>(
  message: string, 
  data: T[], 
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
): ApiResponse<{items: T[], pagination: typeof pagination}> => {
  return createSuccessResponse(message, {
    items: data,
    pagination
  });
};
