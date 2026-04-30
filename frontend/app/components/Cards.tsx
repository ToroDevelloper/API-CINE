import { ReactNode } from "react";
import { Star, TrendingUp, TrendingDown } from "lucide-react";

/**
 * Componentes de Cards Profesionales
 * Reutilizables en toda la aplicación
 */

// ============================================================================
// CARD BASE
// ============================================================================

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  hover?: boolean;
}

export function Card({ children, className = "", elevated = false, hover = true }: CardProps) {
  return (
    <div
      className={`
        bg-gradient-to-br from-[#0f1628] to-[#1a2646]
        border border-[#2a3a5a]
        rounded-xl
        p-6
        backdrop-filter backdrop-blur-md
        transition-all duration-300
        ${elevated ? "shadow-xl" : "shadow-md"}
        ${hover ? "hover:border-[#E50914] hover:shadow-lg hover:shadow-[#E50914]/20" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MOVIE CARD
// ============================================================================

interface MovieCardProps {
  id: string;
  title: string;
  image: string;
  rating: number;
  genre: string;
  onClick?: () => void;
}

export function MovieCard({ id, title, image, rating, genre, onClick }: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg mb-4">
        {/* Imagen */}
        <img
          src={image}
          alt={title}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e27] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-[#E50914] to-[#b20710] text-white font-semibold rounded-lg hover:from-[#ff4747] hover:to-[#E50914] transition-all duration-200 shadow-lg">
            Ver Película
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-[#E50914] text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
          <Star className="w-3 h-3 fill-white" />
          {rating}
        </div>
      </div>

      {/* Info */}
      <div>
        <h3 className="font-bold text-[#f5f7fa] text-sm mb-1 truncate group-hover:text-[#E50914] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#7a8699]">{genre}</p>
      </div>
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: "up" | "down";
  trendValue?: number;
}

export function StatCard({ title, value, icon, trend, trendValue }: StatCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-[#7a8699] text-sm font-medium mb-2">{title}</p>
        <h3 className="text-3xl font-bold text-[#f5f7fa] mb-2">{value}</h3>
         {trend && trendValue && (
           <p className={`text-xs font-semibold flex items-center gap-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
             {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {trendValue}% vs mes anterior
           </p>
         )}
      </div>
      <div className="text-5xl opacity-20">{icon}</div>
    </Card>
  );
}

// ============================================================================
// PROFILE CARD
// ============================================================================

interface ProfileCardProps {
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: "online" | "offline";
}

export function ProfileCard({ name, email, avatar, role = "Premium", status = "online" }: ProfileCardProps) {
  return (
    <Card className="text-center">
      {/* Avatar */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E50914] to-[#b20710] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {avatar || name.charAt(0).toUpperCase()}
        </div>
        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0f1628] ${
          status === "online" ? "bg-green-500" : "bg-gray-500"
        }`}></div>
      </div>

      <h3 className="font-bold text-lg text-[#f5f7fa] mb-1">{name}</h3>
      <p className="text-sm text-[#7a8699] mb-3">{email}</p>
      <div className="inline-block px-3 py-1 bg-[#E50914]/20 text-[#ff4747] text-xs font-semibold rounded-full">
        {role}
      </div>
    </Card>
  );
}

// ============================================================================
// FEATURE CARD
// ============================================================================

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color?: "primary" | "secondary" | "success" | "warning";
}

export function FeatureCard({ title, description, icon, color = "primary" }: FeatureCardProps) {
  const colorMap = {
    primary: "from-[#E50914] to-[#b20710]",
    secondary: "from-purple-500 to-pink-500",
    success: "from-green-500 to-emerald-500",
    warning: "from-orange-500 to-red-500",
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Fondo degradado */}
      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${colorMap[color]}`}></div>

      <div className="relative">
        <div className={`inline-block p-3 bg-gradient-to-br ${colorMap[color]} rounded-lg mb-4 text-2xl`}>
          {icon}
        </div>
        <h3 className="font-bold text-lg text-[#f5f7fa] mb-2">{title}</h3>
        <p className="text-sm text-[#7a8699]">{description}</p>
      </div>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE CARD
// ============================================================================

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-bold text-lg text-[#f5f7fa] mb-2">{title}</h3>
      <p className="text-[#7a8699] mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-block px-6 py-2 bg-gradient-to-r from-[#E50914] to-[#b20710] text-white font-semibold rounded-lg hover:from-[#ff4747] hover:to-[#E50914] transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {action.label}
        </button>
      )}
    </Card>
  );
}
