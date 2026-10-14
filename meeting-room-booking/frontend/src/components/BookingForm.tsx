import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { createBooking } from "../api";
import { validateBookingForm } from "../validation";
import { timeOptions } from "../times";
import type { BookingFormData, Room } from "../types";

interface Props {
  rooms: Room[];
  form: BookingFormData;
  setForm: (form: BookingFormData) => void;
  onBooked: (date: string) => void;
}

const inputClass = "w-full border border-gray-300 rounded px-3 py-2 mt-1";
const labelClass = "block text-sm font-medium text-gray-700";
const errorClass = "text-sm text-red-600 mt-1";

function BookingForm({ rooms, form, setForm, onBooked }: Props) {
  const [errors, setErrors] = useState<any>({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");
    setMessage("");

    const foundErrors = validateBookingForm(form, rooms);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await createBooking({
        roomId: Number(form.roomId),
        title: form.title.trim(),
        organizerEmail: form.organizerEmail.trim(),
        attendees: Number(form.attendees),
        start: form.date + "T" + form.start + ":00Z",
        end: form.date + "T" + form.end + ":00Z",
      });
      setMessage("Room booked.");
      setForm({ ...form, title: "" });
      onBooked(form.date);
    } catch (error: any) {
      setServerError(error.message);
    }
    setSaving(false);
  }

  return (
    <section id="book-section" className="bg-white rounded-lg shadow p-5">
      <h2 className="text-lg font-semibold mb-4">Book a room</h2>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <label className={labelClass}>
          Room
          <select name="roomId" value={form.roomId} onChange={handleChange} className={inputClass}>
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name} (up to {room.capacity})
              </option>
            ))}
          </select>
          {errors.roomId && <p className={errorClass}>{errors.roomId}</p>}
        </label>

        <label className={labelClass}>
          Title
          <input name="title" value={form.title} onChange={handleChange} className={inputClass} />
          {errors.title && <p className={errorClass}>{errors.title}</p>}
        </label>

        <label className={labelClass}>
          Your email
          <input name="organizerEmail" type="email" value={form.organizerEmail} onChange={handleChange} className={inputClass} />
          {errors.organizerEmail && <p className={errorClass}>{errors.organizerEmail}</p>}
        </label>

        <label className={labelClass}>
          Attendees
          <input name="attendees" type="number" min="1" value={form.attendees} onChange={handleChange} className={inputClass} />
          {errors.attendees && <p className={errorClass}>{errors.attendees}</p>}
        </label>

        <label className={labelClass}>
          Date
          <input name="date" type="date" value={form.date} onChange={handleChange} className={inputClass} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className={labelClass}>
            Start
            <select name="start" value={form.start} onChange={handleChange} className={inputClass}>
              {timeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </label>

          <label className={labelClass}>
            End
            <select name="end" value={form.end} onChange={handleChange} className={inputClass}>
              {timeOptions.map((time) => (
                <option key={time.value} value={time.value}>
                  {time.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {errors.time && <p className={errorClass}>{errors.time}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Booking..." : "Book room"}
        </button>

        <div role="alert">{serverError && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{serverError}</p>}</div>
        <div>{message && <p className="text-sm text-green-700 bg-green-50 rounded p-2">{message}</p>}</div>
      </form>
    </section>
  );
}

export default BookingForm;
