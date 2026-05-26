import { useMemo, useState } from "react";

type DateTimeValue = {
  date: string;
  time: string;
};

type SmartDateTimePickerProps = {
  value: DateTimeValue;
  onChange: (value: DateTimeValue) => void;
  labels: {
    label: string;
    note: string;
    chooseDate: string;
    chooseTime: string;
    noSlots: string;
    invalidDate: string;
  };
};

const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

const buildTimeSlots = (date?: Date) => {
  if (!date) return [];
  const day = date.getDay();
  if (day === 0) return [];

  const startHour = day === 6 ? 9 : 9;
  const endHour = day === 6 ? 14 : 19;
  const now = new Date();
  const today = formatDateInput(now) === formatDateInput(date);

  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (const minute of [0, 30]) {
      const candidate = new Date(date);
      candidate.setHours(hour, minute, 0, 0);
      if (candidate < now && today) continue;
      slots.push(candidate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    }
  }

  return slots.filter((slot) => slot !== "14:30");
};

function isValidDate(dateString: string) {
  const date = new Date(dateString);
  return !Number.isNaN(date.getTime());
}

export function SmartDateTimePicker({ value, onChange, labels }: SmartDateTimePickerProps) {
  const [touched, setTouched] = useState(false);

  const selectedDate = useMemo(() => {
    if (!value.date || !isValidDate(value.date)) return null;
    return new Date(value.date);
  }, [value.date]);

  const today = useMemo(() => formatDateInput(new Date()), []);
  const availableSlots = useMemo(() => buildTimeSlots(selectedDate ?? undefined), [selectedDate]);

  const showInvalid = touched && !value.date;
  const showNoSlots = selectedDate && availableSlots.length === 0;

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900">{labels.label}</p>
          <p className="text-sm text-slate-500">{labels.note}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          <span>{labels.chooseDate}</span>
          <input
            type="date"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary"
            min={today}
            value={value.date}
            onChange={(event) => {
              setTouched(true);
              onChange({ date: event.target.value, time: "" });
            }}
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          <span>{labels.chooseTime}</span>
          <select
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary"
            value={value.time}
            onChange={(event) => {
              setTouched(true);
              onChange({ ...value, time: event.target.value });
            }}
            disabled={!availableSlots.length}
          >
            <option value="">{labels.chooseTime}</option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </label>
      </div>

      {showInvalid ? (
        <p className="text-sm text-red-600">{labels.invalidDate}</p>
      ) : showNoSlots ? (
        <p className="text-sm text-orange-600">{labels.noSlots}</p>
      ) : null}
    </div>
  );
}
