"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    clientName: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/work-orders/list"); 
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    try {
      const res = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          scheduledDate: selectedDay.toISOString(),
          billingType: "FIXED_PRICE",
          status: "SCHEDULED"
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: "", clientName: "", description: "", location: "", startTime: "", endTime: "" });
        fetchEvents();
      }
    } catch (error) {
      console.error("Erro ao agendar:", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Agenda</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 bg-zinc-800 rounded text-zinc-100 hover:bg-zinc-700" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-xl font-semibold capitalize text-zinc-100">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <button className="p-2 bg-zinc-800 rounded text-zinc-100 hover:bg-zinc-700" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dayName) => (
          <div key={dayName} className="bg-zinc-900 py-3 text-center font-semibold text-sm text-zinc-300">
            {dayName}
          </div>
        ))}
        {days.map((day) => {
          const isSelectedMonth = isSameMonth(day, monthStart);
          const dayEvents = events.filter(e => e.scheduledDate && isSameDay(parseISO(e.scheduledDate), day));
          
          return (
            <div
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`bg-zinc-900 min-h-[100px] p-2 border-t border-zinc-800 cursor-pointer transition hover:bg-zinc-800/80 ${
                !isSelectedMonth ? "text-zinc-500 bg-zinc-900/50" : "text-zinc-200"
              } ${isSameDay(day, new Date()) ? "bg-indigo-900/20" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? "bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                  {format(day, dateFormat)}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {dayEvents.map((evt) => (
                  <div key={evt.id} className="text-xs truncate bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                    {evt.startTime} - {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold text-zinc-100 mb-4">
              Agendar Novo Serviço ({selectedDay && format(selectedDay, "dd/MM/yyyy")})
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Título do Serviço</label>
                <input required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Cliente</label>
                <input required className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Hora Início</label>
                  <input type="time" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Hora Término</label>
                  <input type="time" className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Local</label>
                <input className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Descrição</label>
                <textarea className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 focus:outline-none focus:border-indigo-500 min-h-[80px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" className="px-4 py-2 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition">Agendar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
