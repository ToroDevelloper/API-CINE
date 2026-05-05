import { ReactNode, useEffect, useState } from "react";
import type { useToastStore } from "../stores/useToastStore";

type Toast = ReturnType<typeof useToastStore.getState>["toasts"][number];

/**
 * Componentes de Alertas y Notificaciones Profesionales
 */

// ============================================================================
// ALERT
// ============================================================================

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  type: AlertType;
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose?: () => void;
  autoClose?: number;
}

const alertConfig = {
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: "✓",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: "✕",
  },
  warning: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: "⚠",
  },
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: "ℹ",
  },
};

export function Alert({
  type,
  title,
  description,
  icon,
  onClose,
  autoClose,
}: AlertProps) {
  const [visible, setVisible] = useState(true);
  const config = alertConfig[type];

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`
        ${config.bg}
        ${config.border}
        border
        rounded-lg
        p-4
        backdrop-filter
        backdrop-blur-sm
        animate-fade-in
      `}
    >
      <div className="flex gap-4">
        <div className={`${config.text} text-xl flex-shrink-0 mt-0.5`}>
          {icon || config.icon}
        </div>
        <div className="flex-1">
          <h4 className={`${config.text} font-semibold mb-1`}>{title}</h4>
          {description && (
            <p className="text-sm text-[#b0b7c3]">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={() => {
              setVisible(false);
              onClose();
            }}
            className="text-[#7a8699] hover:text-[#f5f7fa] transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TOAST CONTAINER (Notificación temporal)
// ============================================================================

interface ToastProps {
  type: AlertType;
  title: string;
  description?: string;
  duration?: number;
}

export function ToastContainer({
  toasts,
}: {
  toasts: Toast[];
}) {
  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="max-w-sm animate-fade-in"
        >
          <Alert
            type={toast.type}
            title={toast.title}
            description={toast.description}
            autoClose={0}
          />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// BADGE
// ============================================================================

type BadgeVariant = "primary" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  icon?: ReactNode;
}

const badgeConfig = {
  primary: "bg-[#E50914]/20 text-[#ff4747]",
  success: "bg-green-500/20 text-green-400",
  warning: "bg-orange-500/20 text-orange-400",
  error: "bg-red-500/20 text-red-400",
  info: "bg-blue-500/20 text-blue-400",
};

export function Badge({ variant = "primary", children, icon }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${badgeConfig[variant]}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`
          ${sizes[size]}
          border-3
          border-[#2a3a5a]
          border-t-[#E50914]
          rounded-full
          animate-spin
        `}
      ></div>
      {text && <p className="text-sm text-[#7a8699]">{text}</p>}
    </div>
  );
}

// ============================================================================
// SKELETON (Placeholder de carga)
// ============================================================================

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = "h-8 w-full", count = 1 }: SkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`
            ${className}
            bg-gradient-to-r
            from-[#1a2646]
            via-[#2a3a5a]
            to-[#1a2646]
            rounded-lg
            animate-pulse
          `}
        ></div>
      ))}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}

const progressColors = {
  primary: "bg-gradient-to-r from-[#E50914] to-[#b20710]",
  success: "bg-gradient-to-r from-green-500 to-emerald-500",
  warning: "bg-gradient-to-r from-orange-500 to-red-500",
  error: "bg-gradient-to-r from-red-500 to-pink-500",
};

export function Progress({
  value,
  max = 100,
  showLabel = false,
  color = "primary",
}: ProgressProps) {
  const percentage = (value / max) * 100;

  return (
    <div>
      <div className="h-2 bg-[#1a2646] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${progressColors[color]}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      {showLabel && (
        <p className="text-xs text-[#7a8699] mt-2">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

// ============================================================================
// DIVIDER
// ============================================================================

interface DividerProps {
  text?: string;
  className?: string;
}

export function Divider({ text, className = "" }: DividerProps) {
  if (text) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-[#2a3a5a] to-transparent"></div>
        <span className="text-xs text-[#7a8699] font-medium">{text}</span>
        <div className="flex-1 h-px bg-gradient-to-l from-[#2a3a5a] to-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`h-px bg-gradient-to-r from-transparent via-[#2a3a5a] to-transparent ${className}`}></div>
  );
}
