import { memo } from 'react';

interface LessonFormProps {
  type?: string;
  id?: string;
  value?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

const LessonFormComponent = ({
  type,
  id,
  value,
  className,
  required,
  placeholder,
}: LessonFormProps) => {
  return (
    <input
      type={type}
      id={id}
      value={value}
      className={className}
      required={required}
      placeholder={placeholder}
    />
  );
};

export const LessonForm = memo(LessonFormComponent);
