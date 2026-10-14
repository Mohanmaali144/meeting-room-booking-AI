import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import BookingForm from "../src/components/BookingForm";
import type { BookingFormData, Room } from "../src/types";

const rooms: Room[] = [{ id: 1, name: "Atlas", capacity: 4, floor: 1, amenities: ["Monitor"] }];

const form: BookingFormData = {
  roomId: "1",
  title: "Planning",
  organizerEmail: "sam@example.com",
  attendees: "6",
  date: "2099-05-14",
  start: "10:00",
  end: "11:00",
};

describe("BookingForm", () => {
  it("shows an error and does not call the server when attendees are more than the capacity", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    render(<BookingForm rooms={rooms} form={form} setForm={() => {}} onBooked={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Book room" }));

    expect(await screen.findByText("Atlas can hold only 4 people.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows the message from the server when the booking is rejected", async () => {
    const serverResponse = {
      error: { code: "BOOKING_CONFLICT", message: "Atlas is already booked from 10:00 to 11:00." },
    };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(serverResponse), { status: 409 }));

    render(<BookingForm rooms={rooms} form={{ ...form, attendees: "3" }} setForm={() => {}} onBooked={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Book room" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Atlas is already booked from 10:00 to 11:00.");
  });
});
