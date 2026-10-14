import { useState } from "react";
import type { ChangeEvent } from "react";
import { cancelBooking } from "../api";
import type { Booking, Room } from "../types";

interface Props {
  date: string;
  setDate: (date: string) => void;
  rooms: Room[];
  bookings: Booking[];
  loading: boolean;
  error: string;
  onCancelled: () => void;
}

const errorClass = "text-sm text-red-600 bg-red-50 rounded p-2 mb-3";

function DayView({ date, setDate, rooms, bookings, loading, error, onCancelled }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value !== "") {
      setDate(e.target.value);
    }
  }

  async function handleCancel(id: number) {
    setCancelError("");
    try {
      await cancelBooking(id);
      setConfirmId(null);
      onCancelled();
    } catch (err: any) {
      setCancelError(err.message);
    }
  }

  function showCancelPart(booking: Booking) {
    if (confirmId === booking.id) {
      return (
        <p className="mt-1">
          Cancel this booking?{" "}
          <button type="button" onClick={() => handleCancel(booking.id)} className="text-red-600 font-medium underline mr-2">
            Yes, cancel
          </button>
          <button type="button" onClick={() => setConfirmId(null)} className="text-gray-600 underline">
            No
          </button>
        </p>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setConfirmId(booking.id)}
        aria-label={"Cancel " + booking.title}
        className="text-red-600 underline mt-1"
      >
        Cancel
      </button>
    );
  }

  return (
    <section className="bg-white rounded-lg shadow p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Schedule</h2>
        <label className="text-sm font-medium text-gray-700">
          Date
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="border border-gray-300 rounded px-3 py-1 ml-2"
          />
        </label>
      </div>

      <div role="alert">
        {error && <p className={errorClass}>{error}</p>}
        {cancelError && <p className={errorClass}>{cancelError}</p>}
      </div>

      {loading && <p className="text-gray-500 mb-3">Loading bookings...</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {rooms.map((room) => {
          const roomBookings = bookings.filter((booking) => booking.roomId === room.id);

          return (
            <div key={room.id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold">
                {room.name} <span className="text-sm font-normal text-gray-500">{room.capacity} seats</span>
              </h3>

              {!loading && roomBookings.length === 0 && <p className="text-sm text-gray-500 mt-2">No bookings.</p>}

              <ul className="mt-2 space-y-2">
                {roomBookings.map((booking) => (
                  <li key={booking.id} className="bg-blue-50 rounded p-2 text-sm">
                    <p className="font-medium">
                      {booking.start.slice(11, 16)} - {booking.end.slice(11, 16)} {booking.title}
                    </p>
                    <p className="text-gray-600">{booking.organizerEmail}</p>
                    {showCancelPart(booking)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DayView;
