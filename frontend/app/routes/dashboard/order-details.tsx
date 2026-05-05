import { useNavigate } from "react-router";
import { useCartStore, useCartTotals } from "../../stores/useCartStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { crearReserva } from "../../services/cineService";
import { crearPedidoSnack } from "../../services/pedidoSnackService";
import { ArrowLeft, CheckCircle, Film, Calendar, MapPin, Armchair, Utensils, CreditCard, Wallet, Building, Smartphone } from "lucide-react";
import { useState } from "react";

type PaymentMethod = "tarjeta" | "efectivo" | "transferencia";

export default function OrderDetails() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const funcionId = useCartStore((s) => s.funcionId);
  const funcionInfo = useCartStore((s) => s.funcionInfo);
  const asientos = useCartStore((s) => s.asientos);
  const snacks = useCartStore((s) => s.snacks);
  const clearCart = useCartStore((s) => s.clearCart);
  const { subtotalAsientos, subtotalSnacks, total } = useCartTotals();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [step, setStep] = useState<"review" | "payment" | "confirmed">("review");

  if (!funcionId && asientos.length === 0 && snacks.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 rounded-[2px] bg-[rgba(229,9,20,0.1)] border border-[#E50914] flex items-center justify-center mb-4">
          <Film className="w-8 h-8 text-[#E50914]" />
        </div>
        <h2 className="text-[24px] font-bold text-text-heading mb-2">No hay reserva en curso</h2>
        <p className="text-[14px] text-text-muted mb-4">Selecciona una función y asientos primero.</p>
        <button
          onClick={() => navigate("/dashboard/reservas")}
          className="px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white text-[14px] font-bold rounded-[2px] transition-colors"
        >
          Ir a Reservas
        </button>
      </div>
    );
  }

  const hasSeats = asientos.length > 0;
  const hasSnacks = snacks.length > 0;

  const paymentMethods: { id: PaymentMethod; label: string; icon: React.ReactNode; description: string }[] = [
    { id: "tarjeta", label: "Tarjeta de Crédito/Débito", icon: <CreditCard className="w-[20px] h-[20px]" />, description: "Visa, Mastercard, AMEX" },
    { id: "efectivo", label: "Efectivo", icon: <Wallet className="w-[20px] h-[20px]" />, description: "Paga en taquilla" },
    { id: "transferencia", label: "Transferencia Bancaria", icon: <Building className="w-[20px] h-[20px]" />, description: "Transferencia directa" },
  ];

  const handleGoToPayment = () => {
    if (!hasSeats && !hasSnacks) {
      setError("Agrega al menos un asiento o snack.");
      return;
    }
    if (!user?._id) {
      setError("Usuario no autenticado.");
      return;
    }
    setError("");
    setStep("payment");
  };

  const handleConfirm = async () => {
    if (!selectedPayment) {
      setError("Selecciona un método de pago.");
      return;
    }
    if (selectedPayment === "tarjeta") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardHolder.trim()) {
        setError("Completa todos los campos de la tarjeta.");
        return;
      }
    }

    setIsProcessing(true);
    setError("");

    try {
      if (hasSeats && funcionId) {
        const reserva = await crearReserva({
          funcion_id: funcionId,
          asientos_ids: asientos.map((a) => a._id),
        });

        if (hasSnacks && reserva._id) {
          const items = snacks.map((s) => ({
            snack_id: s.snack._id,
            cantidad: s.cantidad,
            precio_unitario: s.snack.precio,
            subtotal: s.snack.precio * s.cantidad,
          }));

          await crearPedidoSnack({
            reserva_id: reserva._id,
            items,
            total: subtotalSnacks,
          });
        }
      } else if (hasSnacks) {
        const items = snacks.map((s) => ({
          snack_id: s.snack._id,
          cantidad: s.cantidad,
          precio_unitario: s.snack.precio,
          subtotal: s.snack.precio * s.cantidad,
        }));

        await crearPedidoSnack({
          items,
          total: subtotalSnacks,
        });
      }

      clearCart();
      setStep("confirmed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al confirmar la reserva");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(" ") : v;
  };

  if (step === "confirmed") {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[80vh] space-y-[32px]">
        <div className="w-20 h-20 rounded-[2px] bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <div className="text-center space-y-[12px]">
          <h2 className="text-[32px] font-extrabold text-text-heading">
            {hasSeats ? "¡Reserva Confirmada!" : "¡Pedido Confirmado!"}
          </h2>
          <p className="text-[16px] text-text-muted max-w-md">
            {hasSeats
              ? "Tu reserva ha sido procesada exitosamente. Recibirás un correo con los detalles."
              : "Tu pedido de snacks ha sido procesado exitosamente."}
          </p>
        </div>
        <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 max-w-sm w-full space-y-[16px]">
          {hasSeats && funcionInfo && (
            <>
              <div className="flex justify-between">
                <span className="text-[14px] text-text-muted">Película</span>
                <span className="text-[14px] font-bold text-text-heading">{funcionInfo.peliculaTitulo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-text-muted">Fecha</span>
                <span className="text-[14px] font-bold text-text-heading">{formatDate(funcionInfo.fechaHora)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-text-muted">Sala</span>
                <span className="text-[14px] font-bold text-text-heading">{funcionInfo.salaNombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-text-muted">Asientos</span>
                <span className="text-[14px] font-bold text-text-heading">{asientos.map(a => `${a.fila}${a.numero}`).join(", ")}</span>
              </div>
              <div className="h-px bg-[#27272A]"></div>
            </>
          )}
          {hasSnacks && (
            <div className="flex justify-between">
              <span className="text-[14px] text-text-muted">Snacks</span>
              <span className="text-[14px] font-bold text-text-heading">{snacks.map(s => `${s.snack.nombre} x${s.cantidad}`).join(", ")}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-[14px] text-text-muted">Método de pago</span>
            <span className="text-[14px] font-bold text-text-heading capitalize">{selectedPayment}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[16px] font-bold text-text-heading">Total</span>
            <span className="text-[24px] font-extrabold text-[#E50914]">${total.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex gap-[16px]">
          <button
            onClick={() => navigate("/dashboard/reservas")}
            className="px-[24px] py-[12px] bg-[#27272A] hover:bg-[#3F3F46] text-white text-[14px] font-bold rounded-[2px] transition-colors"
          >
            Ver Mis Reservas
          </button>
          <button
            onClick={() => navigate("/dashboard/peliculas")}
            className="px-[24px] py-[12px] bg-[#E50914] hover:bg-[#c0000c] text-white text-[14px] font-bold rounded-[2px] transition-colors"
          >
            Ver Películas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-[32px]">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#2E1A18] pb-6">
        <button
          onClick={() => {
            if (step === "payment") {
              setStep("review");
              setError("");
            } else {
              navigate(-1);
            }
          }}
          className="w-[40px] h-[40px] rounded-[2px] bg-[#27272A] hover:bg-[#3F3F46] flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-text-muted" />
        </button>
        <div>
          <h1 className="text-[32px] font-extrabold text-text-heading tracking-[-0.02em]">
            {step === "review" ? "Confirmar Reserva" : "Método de Pago"}
          </h1>
          <p className="text-[14px] text-text-muted mt-1">
            {step === "review" ? "Revisa los detalles y procede al pago" : "Selecciona cómo deseas pagar"}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-[2px]">
          <p className="text-red-400 text-[14px]">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-[32px]">
        {/* Left: Content */}
        <div className="space-y-[24px]">
          {step === "review" ? (
            <>
              {/* Movie Info */}
              {hasSeats && funcionInfo && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[16px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-[36px] h-[36px] rounded-[2px] bg-[#E50914]/10 flex items-center justify-center">
                      <Film className="w-[18px] h-[18px] text-[#E50914]" />
                    </div>
                    <h2 className="text-[18px] font-bold text-text-heading">Película</h2>
                  </div>
                  <p className="text-[20px] font-bold text-text-heading">{funcionInfo.peliculaTitulo}</p>
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="w-[16px] h-[16px]" />
                      <span className="text-[14px]">{formatDate(funcionInfo.fechaHora)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <MapPin className="w-[16px] h-[16px]" />
                      <span className="text-[14px]">{funcionInfo.salaNombre} • {funcionInfo.formato}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Seats */}
              {hasSeats && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-[2px] bg-[#E50914]/10 flex items-center justify-center">
                        <Armchair className="w-[18px] h-[18px] text-[#E50914]" />
                      </div>
                      <h2 className="text-[18px] font-bold text-text-heading">Asientos</h2>
                    </div>
                    <span className="text-[14px] text-text-muted">{asientos.length} seleccionado(s)</span>
                  </div>

                  <div className="flex flex-wrap gap-[8px]">
                    {asientos.map((asiento) => (
                      <div
                        key={asiento._id}
                        className="flex items-center gap-2 px-[12px] py-[8px] bg-[#18181B] border border-[#27272A] rounded-[2px]"
                      >
                        <span className="text-[14px] font-bold text-text-heading">
                          {asiento.fila}{asiento.numero}
                        </span>
                        <span className="text-[12px] text-text-muted">({asiento.tipo})</span>
                        <span className="text-[14px] font-bold text-[#E50914]">
                          ${asiento.precio.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#27272A]">
                    <span className="text-[14px] text-text-muted">Subtotal asientos</span>
                    <span className="text-[16px] font-bold text-text-heading">${subtotalAsientos.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Snacks */}
              {hasSnacks && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[16px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-[36px] h-[36px] rounded-[2px] bg-[#E50914]/10 flex items-center justify-center">
                        <Utensils className="w-[18px] h-[18px] text-[#E50914]" />
                      </div>
                      <h2 className="text-[18px] font-bold text-text-heading">Snacks</h2>
                    </div>
                  </div>

                  <div className="space-y-[12px]">
                    {snacks.map((item) => (
                      <div
                        key={item.snack._id}
                        className="flex items-center gap-3 py-[8px] border-b border-[#27272A] last:border-0"
                      >
                        {item.snack.imagen_url ? (
                          <img
                            src={item.snack.imagen_url}
                            alt={item.snack.nombre}
                            className="w-[48px] h-[48px] object-cover rounded-[2px] border border-[#27272A]"
                          />
                        ) : (
                          <div className="w-[48px] h-[48px] bg-[#18181B] rounded-[2px] border border-[#27272A] flex items-center justify-center">
                            <Utensils className="w-[20px] h-[20px] text-[#585858]" />
                          </div>
                        )}
                        <div className="flex-1">
                          <span className="text-[14px] font-bold text-text-heading">{item.snack.nombre}</span>
                          <span className="text-[12px] text-text-muted ml-2">x{item.cantidad}</span>
                        </div>
                        <span className="text-[14px] font-bold text-text-heading">
                          ${(item.snack.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#27272A]">
                    <span className="text-[14px] text-text-muted">Subtotal snacks</span>
                    <span className="text-[16px] font-bold text-text-heading">${subtotalSnacks.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Payment Method Selection */
            <div className="space-y-[24px]">
              <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[20px]">
                <h2 className="text-[18px] font-bold text-text-heading">Selecciona tu método de pago</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-[12px]">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setError("");
                      }}
                      className={`p-4 rounded-[2px] border text-left space-y-[8px] transition-all ${
                        selectedPayment === method.id
                          ? "bg-[#E50914]/10 border-[#E50914] text-[#E50914]"
                          : "bg-[#18181B] border-[#27272A] text-text-muted hover:border-[#585858]"
                      }`}
                    >
                      <div className={selectedPayment === method.id ? "text-[#E50914]" : "text-text-heading"}>
                        {method.icon}
                      </div>
                      <p className="text-[14px] font-bold text-text-heading">{method.label}</p>
                      <p className="text-[12px] text-text-muted">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Details Form */}
              {selectedPayment === "tarjeta" && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[20px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-[2px] bg-[#E50914]/10 flex items-center justify-center">
                      <CreditCard className="w-[18px] h-[18px] text-[#E50914]" />
                    </div>
                    <h2 className="text-[18px] font-bold text-text-heading">Datos de la Tarjeta</h2>
                  </div>

                  <div className="space-y-[16px]">
                    <div>
                      <label className="block text-[12px] font-medium text-text-muted mb-[6px] uppercase tracking-[0.05em]">
                        Nombre del Titular
                      </label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full px-[14px] py-[12px] bg-[#18181B] border border-[#27272A] rounded-[2px] text-[14px] text-text-heading placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-medium text-text-muted mb-[6px] uppercase tracking-[0.05em]">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-[14px] py-[12px] bg-[#18181B] border border-[#27272A] rounded-[2px] text-[14px] text-text-heading placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                        <div className="absolute right-[14px] top-1/2 -translate-y-1/2 flex gap-[6px]">
                          <div className="w-[28px] h-[18px] bg-[#1A1F71] rounded-[2px] flex items-center justify-center text-[8px] font-bold text-white">VISA</div>
                          <div className="w-[28px] h-[18px] bg-[#EB001B] rounded-[2px] flex items-center justify-center">
                            <div className="w-[10px] h-[10px] rounded-full bg-[#F79E1B] -ml-[4px]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-[12px]">
                      <div>
                        <label className="block text-[12px] font-medium text-text-muted mb-[6px] uppercase tracking-[0.05em]">
                          Fecha de Expiración
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, "");
                            if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                            setCardExpiry(v);
                          }}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full px-[14px] py-[12px] bg-[#18181B] border border-[#27272A] rounded-[2px] text-[14px] text-text-heading placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[12px] font-medium text-text-muted mb-[6px] uppercase tracking-[0.05em]">
                          CVV
                        </label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-[14px] py-[12px] bg-[#18181B] border border-[#27272A] rounded-[2px] text-[14px] text-text-heading placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cash Payment Info */}
              {selectedPayment === "efectivo" && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[16px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-[2px] bg-green-500/10 flex items-center justify-center">
                      <Wallet className="w-[18px] h-[18px] text-green-500" />
                    </div>
                    <h2 className="text-[18px] font-bold text-text-heading">Pago en Taquilla</h2>
                  </div>
                  <p className="text-[14px] text-text-muted leading-[1.6]">
                    Tu reserva será confirmada y podrás pagar en efectivo al llegar al cine. Presenta tu confirmación en taquilla.
                  </p>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-[2px]">
                    <p className="text-[13px] text-yellow-300">
                      ⚠ Debes recoger tus boletos al menos 15 minutos antes de la función o tu reserva será cancelada.
                    </p>
                  </div>
                </div>
              )}

              {/* Bank Transfer Info */}
              {selectedPayment === "transferencia" && (
                <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 space-y-[16px]">
                  <div className="flex items-center gap-3">
                    <div className="w-[36px] h-[36px] rounded-[2px] bg-blue-500/10 flex items-center justify-center">
                      <Building className="w-[18px] h-[18px] text-blue-500" />
                    </div>
                    <h2 className="text-[18px] font-bold text-text-heading">Datos Bancarios</h2>
                  </div>
                  <p className="text-[14px] text-text-muted leading-[1.6]">
                    Realiza la transferencia a los siguientes datos:
                  </p>
                  <div className="p-4 bg-[#18181B] border border-[#27272A] rounded-[2px] space-y-[8px]">
                    <div className="flex justify-between">
                      <span className="text-[13px] text-text-muted">Banco</span>
                      <span className="text-[13px] font-bold text-text-heading">Banco Nacional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13px] text-text-muted">Titular</span>
                      <span className="text-[13px] font-bold text-text-heading">Cinema S.A.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13px] text-text-muted">Cuenta</span>
                      <span className="text-[13px] font-bold text-text-heading">0123-4567-8901-2345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[13px] text-text-muted">Referencia</span>
                      <span className="text-[13px] font-bold text-[#E50914]">RES-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Summary */}
        <div className="space-y-[24px]">
          <div className="bg-[#060606] border border-[#585858] rounded-[4px] p-6 sticky top-[96px] space-y-[24px]">
            <h3 className="text-[18px] font-bold text-text-heading">Resumen</h3>

            <div className="space-y-[12px]">
              {hasSeats && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-text-muted">
                    {asientos.length} asiento(s)
                  </span>
                  <span className="text-text-heading">${subtotalAsientos.toFixed(2)}</span>
                </div>
              )}
              {hasSnacks && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-text-muted">
                    {snacks.reduce((sum, s) => sum + s.cantidad, 0)} snack(s)
                  </span>
                  <span className="text-text-heading">${subtotalSnacks.toFixed(2)}</span>
                </div>
              )}

              <div className="h-px bg-[#27272A] my-4"></div>

              <div className="flex justify-between">
                <span className="text-[16px] font-bold text-text-heading">Total</span>
                <span className="text-[24px] font-extrabold text-[#E50914]">${total.toFixed(2)}</span>
              </div>
            </div>

            {step === "review" ? (
              <button
                onClick={handleGoToPayment}
                disabled={!hasSeats && !hasSnacks}
                className="w-full flex items-center justify-center gap-3 py-[14px] bg-[#E50914] hover:bg-[#c0000c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)]"
              >
                <CreditCard className="w-[16px] h-[16px]" />
                Ir a Pagar
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isProcessing || !selectedPayment}
                className="w-full flex items-center justify-center gap-3 py-[14px] bg-[#E50914] hover:bg-[#c0000c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[14px] font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all shadow-[0_0_20px_rgba(229,9,20,0.3)]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-[16px] h-[16px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-[16px] h-[16px]" />
                    Confirmar y Pagar
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-2 text-text-muted text-[12px]">
              <CheckCircle className="w-[14px] h-[14px] text-green-500" />
              <span>Pago seguro y encriptado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
