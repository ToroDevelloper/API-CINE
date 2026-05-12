import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  Utensils,
  CupSoda,
  Triangle,
  Star,
  Gift,
  Package,
  ChefHat,
} from "lucide-react";
import { getSnacks, type Snack } from "../../services/snackService";
import { useCartStore, useCartTotals } from "../../stores/useCartStore";
import { useAppToast } from "../../components/ToastProvider";

export default function Snacks() {
  return <SnacksContent />;
}

const categories = [
  { key: "todos", label: "Todos", icon: ChefHat },
  { key: "palomitas", label: "Palomitas", icon: ChefHat },
  { key: "bebidas", label: "Bebidas", icon: CupSoda },
  { key: "nachos", label: "Nachos", icon: Triangle },
  { key: "dulces", label: "Dulces", icon: Star },
  { key: "combos", label: "Combos", icon: Gift },
  { key: "otros", label: "Otros", icon: Package },
];

const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  todos: ChefHat,
  palomitas: ChefHat,
  bebidas: CupSoda,
  nachos: Triangle,
  dulces: Star,
  combos: Gift,
  otros: Package,
};

function SnacksContent() {
  const { addToast } = useAppToast();
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const cartSnacks = useCartStore((s) => s.snacks);
  const addSnack = useCartStore((s) => s.addSnack);
  const updateSnackCantidad = useCartStore((s) => s.updateSnackCantidad);
  const { total, itemCount } = useCartTotals();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getSnacks();
        if (!alive) return;
        setSnacks(data.filter((s) => s.disponible));
      } catch {
        if (!alive) return;
      } finally {
        if (!alive) return;
        setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filteredSnacks = snacks.filter((s) => {
    const matchesCategory = activeCategory === "todos" || s.categoria === activeCategory;
    const matchesSearch = !searchTerm || s.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSnack = (snack: Snack) => {
    addSnack(snack);
    addToast({ type: "success", title: `${snack.nombre} añadido al carrito` });
  };

  return (
    <div className="p-6 space-y-[32px]">
      {/* Page Header */}
      <div className="flex items-start justify-between border-b border-[#2E1A18] pb-6">
        <div>
          <h1 className="text-[48px] font-extrabold text-white tracking-[-0.02em] leading-[1.1]">
            Snacks
          </h1>
          <p className="text-[18px] text-[#B8B8B8] mt-2 leading-[1.6]">
            Elige tus snacks favoritos y agrégalos a tu reserva.
          </p>
        </div>
        {itemCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary-red/10 border border-primary-red/30 rounded-[2px]">
            <ShoppingCart className="w-[16px] h-[16px] text-primary-red" />
            <span className="text-[14px] font-bold text-primary-red">{itemCount} items · ${total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col gap-[16px]">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#E9BCB6]" />
          <input
            type="text"
            placeholder="Buscar snacks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-[44px] pr-4 py-[12px] bg-[#200E0C] border border-[#5E3F3B] rounded-[2px] text-[16px] text-white placeholder-[rgba(233,188,182,0.5)] focus:outline-none focus:border-[#AF8782] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-[8px] px-[16px] py-[8px] rounded-[2px] text-[14px] font-bold transition-all ${
                  isActive
                    ? "bg-[#3A2522] border border-[#AF8782] text-[#FFDAD5]"
                    : "bg-[#200E0C] border border-[#5E3F3B] text-[#B8B8B8] hover:border-[#AF8782]"
                }`}
              >
                <Icon className="w-[16px] h-[16px]" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Snack Cards Grid */}
      {isLoading ? (
        <p className="text-[#999999] text-[16px]">Cargando snacks...</p>
      ) : filteredSnacks.length === 0 ? (
        <p className="text-[#999999] text-[16px]">No hay snacks disponibles en esta categoría.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[20px]">
          {filteredSnacks.map((snack) => {
            const cartItem = cartSnacks.find((s) => s.snack._id === snack._id);
            return (
              <div
                key={snack._id}
                className="bg-[#060606] border border-[#585858] rounded-[4px] overflow-hidden transition-all hover:border-[#E50914]/50 group"
              >
                {/* Image Area */}
                <div className="relative h-[160px] bg-[#0A0A0A] overflow-hidden">
                  {snack.imagen_url ? (
                    <img
                      src={snack.imagen_url}
                      alt={snack.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.img-fallback');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`absolute inset-0 flex items-center justify-center ${snack.imagen_url ? 'img-fallback hidden' : ''}`}>
                    {(() => {
                      const FallbackIcon = CATEGORY_ICON_MAP[snack.categoria] || Utensils;
                      return <FallbackIcon className="w-[48px] h-[48px] text-[#585858]" />;
                    })()}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-transparent" />

                  {/* Category Badge */}
                  <div className="absolute top-[12px] left-[12px]">
                    <span className="px-[8px] py-[4px] rounded-[2px] text-[10px] font-bold tracking-[0.05em] bg-[#27272A] text-[#A1A1AA] uppercase border border-[#3F3F46]">
                      {snack.categoria}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-[12px]">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#E5E5E5] leading-[1.3]">
                      {snack.nombre}
                    </h3>
                    {snack.descripcion && (
                      <p className="text-[12px] text-[#999999] mt-1 line-clamp-2">
                        {snack.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[20px] font-extrabold text-white">
                      ${snack.precio.toFixed(2)}
                    </span>
                  </div>

                  {/* Cart Controls */}
                  {cartItem ? (
                    <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                      <span className="text-[12px] text-[#999999]">
                        {cartItem.cantidad} en carrito
                      </span>
                      <div className="flex items-center gap-[4px]">
                        <button
                          onClick={() => updateSnackCantidad(snack._id, cartItem.cantidad - 1)}
                          className="w-[28px] h-[28px] rounded-[2px] border border-[#585858] bg-[#200E0C] flex items-center justify-center text-text-main hover:border-primary-red transition-colors"
                        >
                          <span className="text-[14px] font-bold">−</span>
                        </button>
                        <span className="w-[28px] text-center text-[14px] font-bold text-white">
                          {cartItem.cantidad}
                        </span>
                        <button
                          onClick={() => addSnack(snack)}
                          className="w-[28px] h-[28px] rounded-[2px] border border-[#585858] bg-[#200E0C] flex items-center justify-center text-text-main hover:border-primary-red transition-colors"
                        >
                          <Plus className="w-[14px] h-[14px]" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddSnack(snack)}
                      className="w-full py-[10px] text-[12px] font-bold uppercase tracking-[0.1em] text-primary-red border border-primary-red/30 rounded-[2px] hover:bg-primary-red/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-[14px] h-[14px]" />
                      Agregar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
