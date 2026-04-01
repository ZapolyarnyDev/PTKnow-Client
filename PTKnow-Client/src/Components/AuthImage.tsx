import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { getFileUrl } from '../utils/fileUtils';

interface AuthImageProps {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

const isProtectedFileUrl = (value: string) => {
  if (value.startsWith('data:') || value.startsWith('blob:')) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.pathname.startsWith('/api/');
  } catch {
    return value.startsWith('/api/') || value.startsWith('api/');
  }
};

export const AuthImage: React.FC<AuthImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className,
}) => {
  const resolvedSrc = useMemo(() => (src ? getFileUrl(src) : null), [src]);
  const [displaySrc, setDisplaySrc] = useState<string | null>(fallbackSrc ?? null);

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;

    if (!resolvedSrc) {
      setDisplaySrc(fallbackSrc ?? null);
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }

    if (!isProtectedFileUrl(resolvedSrc)) {
      setDisplaySrc(resolvedSrc);
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }

    const loadImage = async () => {
      try {
        const response = await api.get(resolvedSrc, { responseType: 'blob' });
        if (!isActive) {
          return;
        }
        objectUrl = URL.createObjectURL(response.data);
        setDisplaySrc(objectUrl);
      } catch {
        if (!isActive) {
          return;
        }
        setDisplaySrc(fallbackSrc ?? null);
      }
    };

    loadImage();

    return () => {
      isActive = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fallbackSrc, resolvedSrc]);

  return <img src={displaySrc ?? ''} alt={alt} className={className} />;
};
