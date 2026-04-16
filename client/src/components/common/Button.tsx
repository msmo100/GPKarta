import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    fontWeight: 500,
    borderRadius: 6,
    border: '1px solid transparent',
    transition: 'background 0.15s, border-color 0.15s, opacity 0.15s',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: { background: '#2563eb', color: '#fff', borderColor: '#2563eb' },
  secondary: { background: '#f3f4f6', color: '#374151', borderColor: '#e5e7eb' },
  danger: { background: '#dc2626', color: '#fff', borderColor: '#dc2626' },
  ghost: { background: 'transparent', color: '#374151', borderColor: 'transparent' },
};

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { fontSize: 12, padding: '4px 10px', height: 28 },
  md: { fontSize: 14, padding: '7px 14px', height: 36 },
  lg: { fontSize: 15, padding: '10px 20px', height: 42 },
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      style={{
        ...styles.base,
        ...variantStyles[variant],
        ...sizeStyles[size],
        opacity: disabled || loading ? 0.6 : 1,
        ...style,
      }}
    >
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: 'currentColor',
        borderRadius: '50%',
        display: 'inline-block',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
}
