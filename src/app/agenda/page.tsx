"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  // Fetch works / events
  const fetchEvents = async () => {
    try {
      // Usar a rota de API ou Actions? Vamos buscar os work orders para exibir na agenda
      // Para simplificar, poderíamos ter uma rota GET em /api/work-orders, mas se não houver criamos agora.
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={prevMonth}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-semibold capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="outline" onClick={nextMonth}><ChevronRight className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted rounded-xl overflow-hidden border border-border">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dayName) => (
          <div key={dayName} className="bg-card py-3 text-center font-semibold text-sm">
            {dayName}
          </div>
        ))}
        {days.map((day, idx) => {
          const isSelectedMonth = isSameMonth(day, monthStart);
          const dayEvents = events.filter(e => e.scheduledDate && isSameDay(parseISO(e.scheduledDate), day));
          
          return (
            <div
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              className={`bg-card min-h-[100px] p-2 border-t border-border cursor-pointer transition hover:bg-muted/50 ${
                !isSelectedMonth ? "text-muted-foreground bg-muted/20" : ""
              } ${isSameDay(day, new Date()) ? "bg-primary/5" : ""}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : ""}`}>
                  {format(day, dateFormat)}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {dayEvents.map((evt) => (
                  <div key={evt.id} className="text-xs truncate bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.5 rounded">
                    {evt.startTime} - {evt.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Novo Serviço ({selectedDay && format(selectedDay, "dd/MM/yyyy")})</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <Label>Título do Serviço</Label>
              <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>Cliente</Label>
              <Input required value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hora Início (ex: 08:00)</Label>
                <Input type="time" value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
              </div>
              <div>
                <Label>Hora Término (ex: 18:00)</Label>
                <Input type="time" value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Local</Label>
              <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Agendar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
