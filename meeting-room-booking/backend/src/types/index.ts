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

  start: Date;
  end: Date;
  status: string;
  createdAt: Date;
}

export interface NewBooking {
  roomId: number;
  title: string;

  organizerEmail: string;
  attendees: number;
  start: Date;
  
  end: Date;
}
