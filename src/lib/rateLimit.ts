// Simple in-memory rate limiting for API routes
const rateLimit = new Map<string, { count: number; lastReset: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const key = identifier;
  
  const record = rateLimit.get(key);
  
  if (!record) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - record.lastReset > windowMs) {
    rateLimit.set(key, { count: 1, lastReset: now });
    return true;
  }
  
  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return false;
  }
  
  // Increment count
  record.count++;
  return true;
}

export function getRateLimitResponse() {
  return new Response(
    JSON.stringify({ 
      error: 'Too many requests', 
      message: 'Please wait a moment before trying again' 
    }),
    { 
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60'
      }
    }
  );
}