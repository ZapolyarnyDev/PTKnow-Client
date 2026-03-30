import { memo } from 'react';

interface AuthButtonProps {
  type?: 'submit' | 'button' | 'reset';
  onClick?: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const AuthButtonComponent = ({
  type,
  onClick,
  disabled = false,
  isLoading = false,
  children,
  className = '',
}: AuthButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      disabled={isLoading || disabled}
    >
      {isLoading ? 'Загрузка' : children}
    </button>
  );
};

export const AuthButton = memo(AuthButtonComponent);
