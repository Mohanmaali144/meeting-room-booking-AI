export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: number;
  amenities: string[];
}

export interface Booking {
  id: number;
  roomId: number;
  title: string;
  organizerEmail: string;
  attendees: number;
  start: string;
  end: string;
  status: string;
}

export interface BookingFormData {
  roomId: string;
  title: string;
  organizerEmail: string;
  attendees: string;
  date: string;
  start: string;
  end: string;
}
