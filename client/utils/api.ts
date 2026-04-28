const getApiUrl = () => {
  // 1. Priority: Environment variable (works in build and runtime if set)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.endsWith('/') 
      ? process.env.NEXT_PUBLIC_API_URL.slice(0, -1) 
      : process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 2. Fallback for production domains (both client and server side)
  // We check the environment to see if we're likely in production
  const isProd = process.env.NODE_ENV === 'production';
  
  if (isProd) {
    return 'https://careerback.unetei.net/api';
  }

  // 3. Final fallback for local development
  return 'http://127.0.0.1:8000/api';
};

const API_URL = getApiUrl();

export const fetcher = async (url: string, options: RequestInit = {}) => {
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const start = Date.now();
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  const duration = Date.now() - start;
  if (duration > 1000) {
    console.warn(`[API] Very slow request: ${url} took ${duration}ms`);
  }



  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      try {
        const text = await response.text();
        if (text) {
          // Check if it's an HTML error page (common with 404/500 from proxy)
          if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
            message = `Серверийн алдаа (${response.status})`;
          } else {
            message = text;
          }
        }
      } catch {
        // ignore
      }
    }
    
    // Specific messages for common status codes if message is still default
    if (message === 'Something went wrong') {
      if (response.status === 404) message = 'Хүссэн мэдээлэл олдсонгүй (404)';
      if (response.status === 401) message = 'Нэвтрэх эрхгүй байна (401)';
      if (response.status === 403) message = 'Энэ үйлдлийг хийх эрхгүй байна (403)';
      if (response.status >= 500) message = 'Серверийн дотоод алдаа (500)';
    }

    throw new Error(message);
  }

  return response.json();
};
