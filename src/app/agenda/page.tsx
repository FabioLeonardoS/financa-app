"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle } from "lucide-react";

interface WorkOrder {
  id: string;
  title: string;
  clientName: string;
  scheduledDate: string | null;
  startDate: string;
  endDate: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
}

const EMPTY_FORM = {
  title: "",
  clientName: "",
  description: "",
  location: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
};

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<WorkOrder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/work-orders/list");
      if (res.ok) setEvents(await res.json());
    } catch (e) {
      console.error("Erro ao buscar eventos:", e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const openModal = (day: Date) => {
    setSelectedDay(day);
    const iso = format(day, "yyyy-MM-dd");
    setFormData({ ...EMPTY_FORM, startDate: iso, endDate: iso });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validação client-side
    if (!formData.title.trim()) {
      setErrorMsg("O campo Título é obrigatório.");
      return;
    }
    if (!formData.clientName.trim()) {
      setErrorMsg("O campo Cliente é obrigatório.");
      return;
    }
    if (!formData.startDate) {
      setErrorMsg("A Data de Início é obrigatória.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        clientName: formData.clientName,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate
          ? new Date(formData.startDate + "T00:00:00").toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate + "T00:00:00").toISOString()
          : null,
        scheduledDate: formData.startDate
          ? new Date(formData.startDate + "T00:00:00").toISOString()
          : null,
        startTime: formData.startTime || null,
        endTime: formData.endTime || null,
        billingType: "FIXED_PRICE",
        fixedAmount: 0,
      };

      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error || `Erro HTTP ${res.status}: ${res.statusText}`
        );
      }

      closeModal();
      await fetchEvents();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro desconhecido ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-28 max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-5">
        <button
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-100 transition"
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold capitalize text-zinc-100">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h2>
        <button
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-100 transition"
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Grade do Calendário */}
      <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shadow-lg">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
          <div key={d} className="bg-zinc-900 py-2 text-center text-xs font-semibold text-zinc-400">
            {d}
          </div>
        ))}

        {days.map((day) => {
          const inMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter(
            (e) => e.scheduledDate && isSameDay(parseISO(e.scheduledDate), day)
          );

          return (
            <div
              key={day.toString()}
              onClick={() => openModal(day)}
              className={`min-h-[80px] p-1.5 border-t border-zinc-800 cursor-pointer transition
                ${inMonth ? "bg-zinc-900 text-zinc-200" : "bg-zinc-900/40 text-zinc-600"}
                ${isToday ? "bg-indigo-950/50 ring-1 ring-indigo-500/40 ring-inset" : "hover:bg-zinc-800/70"}`}
            >
              <span
                className={`text-xs font-medium inline-flex w-5 h-5 items-center justify-center rounded-full
                  ${isToday ? "bg-indigo-500 text-white" : ""}`}
              >
                {format(day, "d")}
              </span>

              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 2).map((evt) => (
                  <div
                    key={evt.id}
                    className="text-[10px] leading-tight truncate bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded"
                  >
                    {evt.startTime ? `${evt.startTime} ` : ""}
                    {evt.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-[9px] text-zinc-500">+{dayEvents.length - 2} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-zinc-100">Agendar Novo Serviço</h3>
              <button onClick={closeModal} className="text-zinc-400 hover:text-zinc-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Erro */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-900/30 border border-red-500/40 text-red-300 text-sm rounded-lg px-3 py-2 mb-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Título */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Título do Serviço <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Instalação elétrica"
                />
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Cliente <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: João Silva"
                />
              </div>

              {/* Data de Início / Data de Término */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Data de Início <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Data de Término</label>
                  <input
                    type="date"
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Hora de Início / Hora de Término */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Hora de Início</label>
                  <input
                    type="time"
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Hora de Término</label>
                  <input
                    type="time"
                    className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Local */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Local</label>
                <input
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais..."
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? "Salvando..." : "Agendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
