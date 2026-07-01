import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
