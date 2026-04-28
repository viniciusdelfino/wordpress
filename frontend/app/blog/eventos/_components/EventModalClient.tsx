"use client";

import { useRouter } from "next/navigation";
import type { MobilEvent } from "@/app/_components/features/MobilEvents/MobilEvents";
import EventModal from "./EventModal";

interface EventModalClientProps {
  event: MobilEvent;
}

export default function EventModalClient({ event }: EventModalClientProps) {
  const router = useRouter();
  return <EventModal event={event} onClose={() => router.push('/blog/eventos')} />;
}
