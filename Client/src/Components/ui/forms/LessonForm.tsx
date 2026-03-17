interface LessonFormProps {
  type?: string;
  id?: string;
  value?: string;
  className?: string;
  required?: boolean;
  placeholder?: string;
}

export const LessonForm = ({
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
