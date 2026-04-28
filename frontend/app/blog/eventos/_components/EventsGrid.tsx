"use client";

import { useState, useCallback, useMemo } from "react";
import type { MobilEvent } from "@/app/_components/features/MobilEvents/MobilEvents";
import { MobilEventsCard, isEventPast } from "@/app/_components/features/MobilEvents/MobilEvents";
import EventsFilter, { type EventFilters } from "./EventsFilter";
import EventModal from "./EventModal";

interface EventsGridProps {
  desc?: string;
  events?: MobilEvent[];
}

export default function EventsGrid({ desc, events = [] }: EventsGridProps) {
  const [filters, setFilters] = useState<EventFilters>({
    period: "todos",
    sortBy: "recente",
  });
  const [selectedEvent, setSelectedEvent] = useState<MobilEvent | null>(null);

  const handleFilterChange = useCallback((next: EventFilters) => {
    setFilters(next);
  }, []);

  const filtered = useMemo(() => {
    let result = [...events];
    if (filters.period === "proximos") result = result.filter((e) => !isEventPast(e));
    else if (filters.period === "passados") result = result.filter((e) => isEventPast(e));
    if (filters.sortBy === "antigo") result = result.reverse();
    return result;
  }, [events, filters]);

  return (
    <section className="events-grid container py-10">
      <div className="mb-8">
        {desc ? (
          <div
            className="prose prose-headings:text-dark-blue prose-headings:font-semibold lg:prose-headings:text-[2rem] md:prose-headings:text-[1.75rem] prose-headings:text-2xl prose-p:text-low-dark-blue lg:prose-p:text-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
        ) : (
          <>
            <h3 className="text-[24px] font-semibold text-dark-blue">Todos os eventos</h3>
            <p className="text-low-dark-blue mt-2">
              Fique por dentro de todos os eventos da marca Mobil
            </p>
          </>
        )}
      </div>

      <EventsFilter onFilterChange={handleFilterChange} />

      {filtered.length === 0 ? (
        <p className="text-gray-medium-2 text-[16px] py-8">
          Nenhum evento encontrado para os filtros selecionados.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <MobilEventsCard
              key={event.id}
              event={event}
              onCardClick={setSelectedEvent}
            />
          ))}
        </div>
      )}

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </section>
  );
}
