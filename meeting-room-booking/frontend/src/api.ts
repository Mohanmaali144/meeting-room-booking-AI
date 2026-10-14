import type { Booking, Room } from "./types";

async function request(url: string, method: string = "GET", body?: any) {
  let response;
  try {
    response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("The server sent a wrong answer.");
  }

  if (!response.ok) {
    if (data.error.details && data.error.details.fields) {
      const messages = Object.values(data.error.details.fields);
      throw new Error(messages.join(" "));
    }
    throw new Error(data.error.message);
  }

  return data;
}

export function getRooms(): Promise<Room[]> {
  return request("/api/rooms");
}

export function getBookings(date: string): Promise<Booking[]> {
  return request("/api/bookings?date=" + date);
}

export function getAvailableRooms(date: string, start: string, end: string, minCapacity: string): Promise<Room[]> {
  return request("/api/availability?date=" + date + "&start=" + start + "&end=" + end + "&minCapacity=" + minCapacity);
}

export function createBooking(booking: any): Promise<Booking> {
  return request("/api/bookings", "POST", booking);
}

export function cancelBooking(id: number): Promise<Booking> {
  return request("/api/bookings/" + id, "DELETE");
}
