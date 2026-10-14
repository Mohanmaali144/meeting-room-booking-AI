import { useEffect, useState } from "react";
import { getBookings, getRooms } from "./api";
import BookingForm from "./components/BookingForm";
import DayView from "./components/DayView";
import FindRoom from "./components/FindRoom";
import type { Booking, BookingFormData, Room } from "./types";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function App() {
  const [date, setDate] = useState(localStorage.getItem("selectedDate") || getToday());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState<BookingFormData>({
    roomId: "",
    title: "",
    organizerEmail: "",
    attendees: "1",
    date: getToday(),
    start: "10:00",
    end: "11:00",
  });

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      setBookings(await getBookings(date));
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedDate", date);
    loadBookings();
  }, [date]);

  function handleChooseRoom(room: Room, roomDate: string, start: string, end: string) {
    setForm({ ...form, roomId: String(room.id), date: roomDate, start: start, end: end });
    document.getElementById("book-section")?.scrollIntoView();
  }

  function handleBooked(bookedDate: string) {
    if (bookedDate === date) {
      loadBookings();
    } else {
      setDate(bookedDate);
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Meeting rooms</h1>
      <p className="text-sm text-gray-500 mb-4">All times are in UTC.</p>

      <DayView
        date={date}
        setDate={setDate}
        rooms={rooms}
        bookings={bookings}
        loading={loading}
        error={error}
        onCancelled={loadBookings}
      />

      <div className="grid gap-6 md:grid-cols-2 items-start">
        <BookingForm rooms={rooms} form={form} setForm={setForm} onBooked={handleBooked} />
        <FindRoom date={date} onChooseRoom={handleChooseRoom} />
      </div>
    </main>
  );
}

export default App;
