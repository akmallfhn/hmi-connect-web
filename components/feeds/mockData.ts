export interface UpcomingEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
}

export const UPCOMING_EVENTS: UpcomingEvent[] = [
  {
    id: "event-1",
    title: "Latihan Kader 2 Korkom DIY",
    day: "12",
    month: "Agu",
    time: "08.00 WIB",
    location: "Bumi Perkemahan Kaliurang",
  },
  {
    id: "event-2",
    title: "Diskusi Publik: Ekonomi Kerakyatan",
    day: "18",
    month: "Agu",
    time: "19.30 WIB",
    location: "Sekretariat Cabang Jakarta Pusat",
  },
  {
    id: "event-3",
    title: "Rapat Kerja Cabang Se-Sumatra",
    day: "25",
    month: "Agu",
    time: "09.00 WIB",
    location: "Aula PB HMI, Jakarta",
  },
];
