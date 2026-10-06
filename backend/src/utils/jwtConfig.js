/**
 * Helper to parse JWT expiration strings into milliseconds for cookies, and 
 * return a safe string/number for jsonwebtoken.
 */
export const parseJwtExpiration = (expiresIn) => {
  if (!expiresIn) {
    return {
      jwtExpiresIn: '1h',
      cookieMaxAgeMs: 60 * 60 * 1000 // 1 hour
    };
  }

  const str = String(expiresIn).trim();
  
  // If it's a pure number or a numeric string without unit, treat as seconds
  if (/^\d+$/.test(str)) {
    const seconds = parseInt(str, 10);
    return {
      jwtExpiresIn: seconds, // jsonwebtoken accepts number as seconds
      cookieMaxAgeMs: seconds * 1000
    };
  }

  // Parse strings like "15m", "1h", "7d"
  const match = str.match(/^(\d+)([smhd])$/);
  if (match) {
    const value = parseInt(match[1], 10);
    const unit = match[2];
    let ms = 0;
    if (unit === 's') ms = value * 1000;
    else if (unit === 'm') ms = value * 60 * 1000;
    else if (unit === 'h') ms = value * 60 * 60 * 1000;
    else if (unit === 'd') ms = value * 24 * 60 * 60 * 1000;

    return {
      jwtExpiresIn: str, // jsonwebtoken handles "1h", "15m" etc.
      cookieMaxAgeMs: ms
    };
  }

  // Fallback
  return {
    jwtExpiresIn: '1h',
    cookieMaxAgeMs: 60 * 60 * 1000
  };
};
