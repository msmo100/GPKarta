import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontWeight: 500, fontSize: 13, marginBottom: 5, color: '#374151' }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && !error && <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #e5e7eb',
  borderRadius: 6,
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.15s',
  background: '#fff',
  color: '#111827',
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: 80,
        fontFamily: 'inherit',
        ...props.style,
      }}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}
