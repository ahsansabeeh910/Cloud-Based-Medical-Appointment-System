import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import './SlotPicker.css';

const DEFAULT_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM',
  '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM',
];

export default function SlotPicker({ selectedDate, selectedSlot, onDateChange, onSlotChange, bookedSlots = [], availableSlots }) {
  const [slots, setSlots] = useState(availableSlots || DEFAULT_SLOTS);

  useEffect(() => {
    if (availableSlots && availableSlots.length > 0) {
      setSlots(availableSlots);
    } else {
      setSlots(DEFAULT_SLOTS);
    }
  }, [availableSlots]);

  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="slot-picker">
      <div className="slot-picker-date">
        <label htmlFor="appointment-date">
          <FiClock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Select Date
        </label>
        <input
          type="date"
          id="appointment-date"
          value={selectedDate || ''}
          min={getTomorrow()}
          max={getMaxDate()}
          onChange={(e) => {
            onDateChange(e.target.value);
            if (onSlotChange) onSlotChange(null);
          }}
        />
      </div>

      {selectedDate && (
        <div>
          <p className="slot-picker-label">Available Time Slots</p>
          {slots.length > 0 ? (
            <div className="slot-picker-grid">
              {slots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    className={`slot-chip ${selectedSlot === slot ? 'selected' : ''} ${isBooked ? 'unavailable' : ''}`}
                    onClick={() => !isBooked && onSlotChange(slot)}
                    disabled={isBooked}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="slot-picker-empty">
              No slots available for this date
            </div>
          )}
        </div>
      )}
    </div>
  );
}
