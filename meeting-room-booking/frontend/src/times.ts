export const timeOptions: { value: string; label: string }[] = [];

const minutes = ["00", "15", "30", "45"];

for (let hour = 8; hour <= 20; hour++) {
  for (const minute of minutes) {
    if (hour === 20 && minute !== "00") {
      continue;
    }

    const value = String(hour).padStart(2, "0") + ":" + minute;

    let hour12 = hour;
    let ampm = "AM";
    if (hour >= 12) {
      ampm = "PM";
    }
    if (hour > 12) {
      hour12 = hour - 12;
    }
    const label = hour12 + ":" + minute + " " + ampm;

    timeOptions.push({ value: value, label: label });
  }
}
