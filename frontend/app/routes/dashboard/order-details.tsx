import { useNavigate } from "react-router";
import { useCartStore, useCartTotals } from "../../stores/useCartStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { crearReserva } from "../../services/cineService";
import { crearPedidoSnack } from "../../services/pedidoSnackService";
import { apiFetch } from "../../services/apiClient";
import { ArrowLeft, CheckCircle, Film, MapPin, Armchair, Utensils, CreditCard, Wallet, Building, User, X, DollarSign } from "lucide-react";
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
  const { subtotalSnacks, total } = useCartTotals();
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

        await apiFetch("/api/pagos", {
          method: "POST",
          json: { reserva_id: reserva._id, metodo_pago: selectedPayment },
        });
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
      <div className="flex items-center justify-center min-h-[80vh] p-6">
        <div className="w-full max-w-[672px] bg-[#1A1A1A] border border-[#444444] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[8px] overflow-hidden">
          <div className="flex justify-between items-center p-6 bg-[#0A0A0A] border-b border-[#333333]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-[2px] flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {hasSeats ? "¡Reserva Confirmada!" : "¡Pedido Confirmado!"}
                </h2>
                <p className="text-sm text-[#71717A]">Transacción exitosa</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-[#0A0A0A] space-y-4">
            {hasSeats && funcionInfo && (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2A2A2A] rounded-[12px] flex items-center justify-center">
                    <Film className="w-4 h-4 text-[#A1A1AA]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{funcionInfo.peliculaTitulo}</p>
                    <p className="text-xs text-[#71717A]">{formatDate(funcionInfo.fechaHora)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#71717A]">
                  <MapPin className="w-3 h-3 text-[#E50914]" />
                  <span>{funcionInfo.salaNombre} &bull; {funcionInfo.formato}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {asientos.map(a => (
                    <span key={a._id} className="text-xs font-mono bg-[#18181B] border border-[#333333] rounded-[2px] px-2 py-1 text-white">
                      {a.fila}{a.numero}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {hasSnacks && (
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-3">
                <p className="text-xs text-[#71717A]">
                  Snacks: {snacks.map(s => `${s.snack.nombre} x${s.cantidad}`).join(", ")}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center p-6 bg-[#1A1A1A] border-t border-[#333333]">
            <span className="text-sm text-[#71717A]">Método: <span className="capitalize text-white">{selectedPayment}</span></span>
            <div className="text-right">
              <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase">Total</span>
              <p className="text-3xl font-bold text-[#E50914] font-mono">${total.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 bg-[#0A0A0A]">
            <button
              onClick={() => navigate("/dashboard/reservas")}
              className="flex-1 py-3 bg-[#27272A] hover:bg-[#3F3F46] text-white text-sm font-bold rounded-[2px] transition-colors"
            >
              Ver Mis Reservas
            </button>
            <button
              onClick={() => navigate("/dashboard/peliculas")}
              className="flex-1 py-3 bg-[#E50914] hover:bg-[#c0000c] text-white text-sm font-bold rounded-[2px] transition-colors"
            >
              Ver Películas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center min-h-screen p-6 pt-12">
      <div className="w-full max-w-[672px] bg-[#1A1A1A] border border-[#444444] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-[8px] overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 bg-[#0A0A0A] border-b border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[rgba(229,9,20,0.1)] border border-[rgba(229,9,20,0.3)] rounded-[2px] flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#E50914]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {step === "review" ? "Confirmar Pago" : "Método de Pago"}
              </h2>
              <p className="text-sm text-[#71717A]">
                {step === "review" ? "Revisa los detalles de tu orden" : "Selecciona cómo deseas pagar"}
              </p>
            </div>
          </div>
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
            {step === "review" ? (
              <ArrowLeft className="w-[18px] h-[18px] text-[#71717A]" />
            ) : (
              <X className="w-[18px] h-[18px] text-[#71717A]" />
            )}
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500 rounded-[2px]">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 bg-[#0A0A0A] space-y-4">
          {step === "review" ? (
            <>
              {/* Customer Info */}
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-3 space-y-3">
                <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase">CLIENTE</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#2A2A2A] rounded-[12px] flex items-center justify-center">
                    <User className="w-3 h-3 text-[#A1A1AA]" />
                  </div>
                  <span className="text-base font-medium text-white">{user?.nombre || user?.email}</span>
                </div>
                <div className="border-t border-[#333333] pt-3 space-y-1">
                  <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase">UBICACIÓN</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E50914]" />
                    <span className="text-base text-white">{funcionInfo?.salaNombre || "Sucursal Centro"}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#2A2A2A] border-b border-[#333333]">
                      <th className="text-left px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Item</th>
                      <th className="text-center px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Cant</th>
                      <th className="text-right px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Precio</th>
                      <th className="text-right px-4 py-2 text-xs font-bold tracking-[0.1em] text-[#A1A1AA] uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asientos.map((asiento) => (
                      <tr key={asiento._id} className="border-b border-[rgba(51,51,51,0.5)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#18181B] border border-[#333333] rounded-[2px] flex items-center justify-center">
                              <Armchair className="w-[22px] h-[22px] text-[#52525B]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{asiento.fila}{asiento.numero}</p>
                              <p className="text-xs text-[#71717A]">{asiento.tipo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono text-sm text-[#D4D4D8]">1</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-[#A1A1AA]">${asiento.precio.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-bold text-white">${asiento.precio.toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                    {snacks.map((item) => (
                      <tr key={item.snack._id} className="border-b border-[rgba(51,51,51,0.5)] last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#18181B] border border-[#333333] rounded-[2px] flex items-center justify-center overflow-hidden">
                              {item.snack.imagen_url ? (
                                <img
                                  src={item.snack.imagen_url}
                                  alt={item.snack.nombre}
                                  className="w-full h-full object-cover mix-blend-luminosity opacity-80"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const icon = document.createElement('div');
                                      icon.innerHTML = '<svg class="w-[22px] h-[22px] text-[#52525B]" ...></svg>';
                                      parent.appendChild(icon);
                                    }
                                  }}
                                />
                              ) : (
                                <Utensils className="w-[22px] h-[22px] text-[#52525B]" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.snack.nombre}</p>
                              <p className="text-xs text-[#71717A]">{item.snack.categoria || "Snack"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-mono text-sm text-[#D4D4D8]">{item.cantidad}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm text-[#A1A1AA]">${item.snack.precio.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-bold text-white">${(item.snack.precio * item.cantidad).toFixed(2)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            /* Payment Method Selection */
            <div className="space-y-4">
              <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-4 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-[0.05em]">Selecciona tu método de pago</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedPayment(method.id);
                        setError("");
                      }}
                      className={`p-4 rounded-[2px] border text-left space-y-2 transition-all ${
                        selectedPayment === method.id
                          ? "bg-[rgba(229,9,20,0.1)] border-[#E50914]"
                          : "bg-[#18181B] border-[#333333] hover:border-[#585858]"
                      }`}
                    >
                      <div className={selectedPayment === method.id ? "text-[#E50914]" : "text-white"}>
                        {method.icon}
                      </div>
                      <p className="text-sm font-bold text-white">{method.label}</p>
                      <p className="text-xs text-[#71717A]">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedPayment === "tarjeta" && (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#E50914]" />
                    <h3 className="text-sm font-bold text-white">Datos de la Tarjeta</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#71717A] mb-1 uppercase tracking-[0.05em]">Nombre del Titular</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Como aparece en la tarjeta"
                        className="w-full px-3 py-3 bg-[#18181B] border border-[#333333] rounded-[2px] text-sm text-white placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#71717A] mb-1 uppercase tracking-[0.05em]">Número de Tarjeta</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-3 py-3 bg-[#18181B] border border-[#333333] rounded-[2px] text-sm text-white placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <div className="w-7 h-4.5 bg-[#1A1F71] rounded-[2px] flex items-center justify-center text-[6px] font-bold text-white">VISA</div>
                          <div className="w-7 h-4.5 bg-[#EB001B] rounded-[2px] flex items-center justify-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] -ml-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1 uppercase tracking-[0.05em]">Fecha Exp.</label>
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
                          className="w-full px-3 py-3 bg-[#18181B] border border-[#333333] rounded-[2px] text-sm text-white placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#71717A] mb-1 uppercase tracking-[0.05em]">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="&bull;&bull;&bull;"
                          maxLength={4}
                          className="w-full px-3 py-3 bg-[#18181B] border border-[#333333] rounded-[2px] text-sm text-white placeholder-[#585858] focus:outline-none focus:border-[#E50914] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment === "efectivo" && (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5 text-green-500" />
                    <h3 className="text-sm font-bold text-white">Pago en Taquilla</h3>
                  </div>
                  <p className="text-sm text-[#71717A] leading-relaxed">
                    Tu reserva será confirmada y podrás pagar en efectivo al llegar al cine. Presenta tu confirmación en taquilla.
                  </p>
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-[2px]">
                    <p className="text-xs text-yellow-300">
                      Debes recoger tus boletos al menos 15 minutos antes de la función o tu reserva será cancelada.
                    </p>
                  </div>
                </div>
              )}

              {selectedPayment === "transferencia" && (
                <div className="bg-[#1A1A1A] border border-[#333333] rounded-[2px] p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-bold text-white">Datos Bancarios</h3>
                  </div>
                  <p className="text-sm text-[#71717A] leading-relaxed">Realiza la transferencia a los siguientes datos:</p>
                  <div className="p-3 bg-[#18181B] border border-[#333333] rounded-[2px] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-[#71717A]">Banco</span>
                      <span className="text-xs font-bold text-white">Banco Nacional</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#71717A]">Titular</span>
                      <span className="text-xs font-bold text-white">Cinema S.A.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#71717A]">Cuenta</span>
                      <span className="text-xs font-bold text-white">0123-4567-8901-2345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#71717A]">Referencia</span>
                      <span className="text-xs font-bold text-[#E50914]">RES-{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-end p-6 bg-[#1A1A1A] border-t border-[#333333]">
          <div>
            <p className="text-sm text-[#71717A]">
              {step === "review" ? "Orden lista para confirmar" : "Selecciona un método y continúa"}
            </p>
          </div>
          <div className="space-y-1 text-right">
            <div className="flex justify-between gap-8">
              <span className="text-sm text-[#A1A1AA]">Subtotal</span>
              <span className="font-mono text-sm text-[#A1A1AA]">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center border-t border-[#333333] pt-3">
              <span className="text-xs font-bold tracking-[0.1em] text-[#71717A] uppercase">Total</span>
              <span className="text-3xl font-bold text-[#E50914] font-mono tracking-[-0.02em]">${total.toFixed(2)}</span>
            </div>
            <div className="pt-3">
              {step === "review" ? (
                <button
                  onClick={handleGoToPayment}
                  disabled={!hasSeats && !hasSnacks}
                  className="w-full py-3 bg-[#E50914] hover:bg-[#c0000c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  Ir a Pagar
                </button>
              ) : (
                <button
                  onClick={handleConfirm}
                  disabled={isProcessing || !selectedPayment}
                  className="w-full py-3 bg-[#E50914] hover:bg-[#c0000c] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold uppercase tracking-[0.1em] rounded-[2px] transition-all shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    "Confirmar y Pagar"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
