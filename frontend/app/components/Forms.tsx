import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

/**
 * Componentes de Formularios Profesionales
 * Con validación integrada y estilos modernos
 */

// ============================================================================
// FORM CONTAINER
// ============================================================================

interface FormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
}

export function Form({ children, onSubmit, className = "" }: FormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {children}
    </form>
  );
}

// ============================================================================
// FORM GROUP
// ============================================================================

interface FormGroupProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormGroup({ label, error, required = false, children }: FormGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-[#f5f7fa]">
        {label}
        {required && <span className="text-[#E50914] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[#ff4747] font-medium flex items-center gap-1">
           {error}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// INPUT TEXT
// ============================================================================

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full
        px-4 py-3
        bg-[#0f1628]
        border
        ${error ? "border-[#ff4747]" : "border-[#2a3a5a]"}
        rounded-lg
        text-[#f5f7fa]
        placeholder-[#7a8699]
        focus:outline-none
        focus:border-[#E50914]
        focus:ring-2
        focus:ring-[#E50914]/30
        focus:bg-[#1a2646]
        transition-all
        duration-200
        font-medium
        ${className}
      `}
      {...props}
    />
  );
}

// ============================================================================
// TEXTAREA
// ============================================================================

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error = false, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      className={`
        w-full
        px-4 py-3
        bg-[#0f1628]
        border
        ${error ? "border-[#ff4747]" : "border-[#2a3a5a]"}
        rounded-lg
        text-[#f5f7fa]
        placeholder-[#7a8699]
        focus:outline-none
        focus:border-[#E50914]
        focus:ring-2
        focus:ring-[#E50914]/30
        focus:bg-[#1a2646]
        transition-all
        duration-200
        font-medium
        resize-vertical
        min-h-[120px]
        ${className}
      `}
      {...props}
    />
  );
}

// ============================================================================
// SELECT
// ============================================================================

interface SelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
  error?: boolean;
}

export function Select({ options, error = false, className = "", ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full
        px-4 py-3
        bg-[#0f1628]
        border
        ${error ? "border-[#ff4747]" : "border-[#2a3a5a]"}
        rounded-lg
        text-[#f5f7fa]
        focus:outline-none
        focus:border-[#E50914]
        focus:ring-2
        focus:ring-[#E50914]/30
        transition-all
        duration-200
        font-medium
        ${className}
      `}
      {...props}
    >
      <option value="">Selecciona una opción</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// CHECKBOX
// ============================================================================

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        className={`
          w-5 h-5
          rounded
          border-2
          border-[#2a3a5a]
          bg-[#0f1628]
          text-[#E50914]
          focus:ring-2
          focus:ring-[#E50914]/30
          cursor-pointer
          accent-[#E50914]
          transition-all
          duration-200
          ${className}
        `}
        {...props}
      />
      <span className="text-sm font-medium text-[#f5f7fa]">{label}</span>
    </label>
  );
}

// ============================================================================
// RADIO BUTTON
// ============================================================================

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Radio({ label, className = "", ...props }: RadioProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="radio"
        className={`
          w-5 h-5
          rounded-full
          border-2
          border-[#2a3a5a]
          bg-[#0f1628]
          text-[#E50914]
          focus:ring-2
          focus:ring-[#E50914]/30
          cursor-pointer
          accent-[#E50914]
          transition-all
          duration-200
          ${className}
        `}
        {...props}
      />
      <span className="text-sm font-medium text-[#f5f7fa]">{label}</span>
    </label>
  );
}

// ============================================================================
// BUTTONS
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className = "",
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-[#E50914] to-[#b20710] hover:from-[#ff4747] hover:to-[#E50914] text-white shadow-lg hover:shadow-xl",
    secondary: "bg-[#1a2646] border border-[#2a3a5a] text-[#f5f7fa] hover:border-[#E50914] hover:bg-[#2a3a5a]",
    danger: "bg-gradient-to-r from-[#ff4747] to-[#E50914] hover:from-[#ff6b6b] hover:to-[#ff4747] text-white shadow-lg hover:shadow-xl",
    ghost: "bg-transparent border border-[#2a3a5a] text-[#b0b7c3] hover:text-[#f5f7fa] hover:border-[#E50914]",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-lg
        font-semibold
        transition-all
        duration-200
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// ============================================================================
// FORM EXAMPLE
// ============================================================================

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-4 pb-6 border-b border-[#2a3a5a]">
      <div>
        <h3 className="text-lg font-bold text-[#f5f7fa] mb-1">{title}</h3>
        {description && <p className="text-sm text-[#7a8699]">{description}</p>}
      </div>
      {children}
    </div>
  );
}
