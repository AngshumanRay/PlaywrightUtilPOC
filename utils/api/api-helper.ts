// =============================================================================
// utils/api/api-helper.ts — REST API TESTING UTILITY
// =============================================================================
// PURPOSE:
//   A reusable HTTP client for making API calls during tests.
//   Many tests need to call backend APIs directly — not just interact with
//   the browser UI. Common use cases:
//
//   - PRE-TEST:  Call an API to create test data (e.g., POST /api/users)
//   - IN-TEST:   Call an API to verify side effects (e.g., GET /api/orders)
//   - POST-TEST: Call an API to clean up (e.g., DELETE /api/test-data)
//
// WHAT IS A REST API?
//   An API (Application Programming Interface) lets programs talk to each other.
//   A REST API is an API accessed via HTTP URLs — the same way your browser
//   loads web pages, but the server returns data (JSON) instead of HTML.
//
// WHEN IS THIS CALLED?
//   - Inside individual tests that need API calls
//   - In global-setup.ts if you need to seed data via API before tests
//   - In global-teardown.ts if you need to clean up via API after tests
//
// HOW TO ENABLE:
//   Set API_BASE_URL in .env. If not set, defaults to BASE_URL.
//   API_AUTH_TOKEN is optional — only needed for authenticated endpoints.
// =============================================================================

import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { config } from '../../config/environment';
import { logger } from '../helpers/logger';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Standardized API response wrapper.
 * Every api-helper function returns this shape for consistency.
 */
export interface ApiResponse<T = any> {
  success:    boolean;       // Did the call succeed (HTTP 2xx)?
  status:     number;        // HTTP status code (200, 404, 500, etc.)
  data:       T | null;      // The response body (parsed JSON)
  message:    string;        // Human-readable summary
  durationMs: number;        // How long the call took
}

// =============================================================================
// FUNCTION: createApiClient
// =============================================================================
// PURPOSE:
//   Creates a pre-configured axios HTTP client for making API calls.
//   It sets the base URL, default headers, and optional auth token.
//
// RETURNS:
//   An axios instance ready to make GET/POST/PUT/DELETE calls.
// =============================================================================
export function createApiClient(): AxiosInstance {
  // If a dedicated API base URL is configured, use it.
  // Otherwise fall back to the app base URL.
  // NOTE: When tests pass absolute URLs (e.g. 'https://jsonplaceholder.typicode.com/posts/1'),
  // axios will use the absolute URL directly and ignore baseURL — this is expected axios behavior.
  const baseURL = config.api.baseUrl || config.app.baseUrl;

  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type':  'application/json',
      'Accept':        'application/json',
    },
  });

  // Add auth token if configured
  if (config.api.authToken && config.api.authToken !== 'your-api-auth-token') {
    client.defaults.headers.common['Authorization'] = `Bearer ${config.api.authToken}`;
  }

  // Request interceptor — log every outgoing API call
  client.interceptors.request.use((req) => {
    // Build the final URL — prefer the full resolved URL when available
    const fullUrl = req.url?.startsWith('http') ? req.url : `${req.baseURL ?? ''}${req.url ?? ''}`;
    logger.info(`🌐 API → ${req.method?.toUpperCase()} ${fullUrl}`);
    return req;
  });

  // Response interceptor — log the result
  client.interceptors.response.use(
    (res) => {
      logger.info(`🌐 API ← ${res.status} ${res.statusText}`);
      return res;
    },
    (err) => {
      if (err.response) {
        logger.warn(`🌐 API ← ${err.response.status} ${err.response.statusText}`);
      } else {
        logger.error(`🌐 API ← Network error: ${err.message}`);
      }
      return Promise.reject(err);
    }
  );

  return client;
}

// =============================================================================
// FUNCTION: apiGet / apiPost / apiPut / apiDelete
// =============================================================================
// PURPOSE:
//   Convenience functions for the 4 most common HTTP methods.
//   They all return the same ApiResponse shape for consistency.
//
// EXAMPLES:
//   const users = await apiGet<User[]>('/api/users');
//   const newOrder = await apiPost('/api/orders', { item: 'Widget', qty: 5 });
//   const updated = await apiPut('/api/users/123', { name: 'Jane' });
//   const deleted = await apiDelete('/api/users/123');
// =============================================================================

export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('GET', url, undefined, config);
}

export async function apiPost<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('POST', url, data, config);
}

export async function apiPut<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('PUT', url, data, config);
}

export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  return makeApiCall<T>('DELETE', url, undefined, config);
}

// =============================================================================
// INTERNAL: makeApiCall
// =============================================================================
// The actual implementation that all the convenience functions use.
// =============================================================================
async function makeApiCall<T>(
  method:     string,
  url:        string,
  data?:      any,
  reqConfig?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const client   = createApiClient();
  const startMs  = Date.now();

  try {
    const response: AxiosResponse<T> = await client.request({
      method,
      url,
      data,
      ...reqConfig,
    });

    return {
      success:    true,
      status:     response.status,
      data:       response.data,
      message:    `${method} ${url} → ${response.status}`,
      durationMs: Date.now() - startMs,
    };

  } catch (error: any) {
    const status = error.response?.status || 0;
    return {
      success:    false,
      status,
      data:       error.response?.data || null,
      message:    `${method} ${url} → ${status || 'Network Error'}: ${error.message}`,
      durationMs: Date.now() - startMs,
    };
  }
}
