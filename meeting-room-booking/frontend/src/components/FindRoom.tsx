import { useState } from "react";
import type { FormEvent } from "react";
import { getAvailableRooms } from "../api";
import { getTimeError } from "../validation";
import { timeOptions } from "../times";
import type { Room } from "../types";

interface Props {
  date: string;
  onChooseRoom: (room: Room, date: string, start: string, end: string) => void;
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 mt-1";
const labelClass = "block text-sm font-medium text-gray-700";

function FindRoom({ date, onChooseRoom }: Props) {
  const [searchDate, setSearchDate] = useState(date);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("11:00");
  const [minCapacity, setMinCapacity] = useState("1");

  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setRooms(null);

    const timeError = getTimeError(searchDate, start, end);
    if (timeError) {
      setError(timeError);
      return;
    }
    if (!Number.isInteger(Number(minCapacity)) || Number(minCapacity) < 1) {
      setError("Minimum capacity must be a whole number of at least 1.");
      return;
    }

    setLoading(true);
    try {
      const result = await getAvailableRooms(searchDate, start, end, minCapacity);
      setRooms(result);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <section aria-labelledby="find-heading" className="bg-white rounded-lg shadow p-5">
      <h2 id="find-heading" className="text-lg font-semibold mb-4">
        Find a free room
      </h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <label className={labelClass}>
          Date
          <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className={inputClass} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Start
            <select value={start} onChange={(e) => setStart(e.target.value)} className={inputClass}>
              {timeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            End
            <select value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass}>
              {timeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className={labelClass}>
          Minimum seats
          <input
            type="number"
            min="1"
            value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)}
            className={inputClass}
          />
        </label>

        <button type="submit" className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700">
          Search
        </button>
      </form>

      <div role="status" className="mt-4">
        {loading && <p className="text-gray-500">Searching...</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>}
        {rooms && rooms.length === 0 && <p className="text-gray-500">No rooms are free for that time.</p>}
        {rooms && rooms.length > 0 && (
          <ul className="divide-y">
            {rooms.map((room) => (
              <li key={room.id} className="flex items-center justify-between py-2">
                <span>
                  <span className="font-medium">{room.name}</span>
                  <span className="text-sm text-gray-500"> - {room.capacity} seats</span>
                </span>
                <button
                  type="button"
                  onClick={() => onChooseRoom(room, searchDate, start, end)}
                  className="border border-blue-600 text-blue-600 rounded px-3 py-1 text-sm hover:bg-blue-50"
                >
                  Book {room.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default FindRoom;
