'use client';

import { useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

/**
 * The inline two-month stay calendar.
 *
 * SEC-12, MEASURED: this lives in the **left** column, not in the booking card.
 * The prev-month control sits at the content edge and the next-month control at
 * x 729.5 — so the pair spans the full 652px column — both 32 × 32, with a
 * "Clear dates" control below. October and November 2026 were showing, with
 * 18–23 October selected.
 *
 * Day-cell metrics were not measured, so the cell size is provisional. What is
 * implemented is the behaviour: a real range selection, real month paging, and
 * full keyboard support — no date-picker dependency, no network, no booking API.
 *
 * Keyboard model follows the ARIA grid pattern: arrows move by day and week,
 * Home/End jump to the ends of a week, PageUp/PageDown change month, and only
 * one day is tabbable at a time (roving tabindex) so the calendar costs one Tab
 * stop rather than sixty.
 */

interface StayCalendarProps {
  /** Deterministic initial range — no `new Date()` at render, so SSR matches. */
  initialFrom: string;
  initialTo: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

const iso = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const monthLabel = (year: number, month: number) =>
  new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, month, 1)),
  );

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const leading = first.getUTCDay();
  return { daysInMonth, leading };
}

function shiftMonth(year: number, month: number, by: number) {
  const next = new Date(Date.UTC(year, month + by, 1));
  return { year: next.getUTCFullYear(), month: next.getUTCMonth() };
}

export function StayCalendar({ initialFrom, initialTo }: StayCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const parts = initialFrom.split('-').map(Number);
    return { year: parts[0] ?? 2026, month: (parts[1] ?? 10) - 1 };
  });
  const [from, setFrom] = useState<string | null>(initialFrom);
  const [to, setTo] = useState<string | null>(initialTo);
  const [focusedDay, setFocusedDay] = useState<string>(initialFrom);
  const gridRef = useRef<HTMLDivElement>(null);

  const second = useMemo(() => shiftMonth(cursor.year, cursor.month, 1), [cursor]);

  const select = (day: string) => {
    /* First click after a complete range starts a new one. */
    if (!from || (from && to)) {
      setFrom(day);
      setTo(null);
    } else if (day < from) {
      setFrom(day);
    } else {
      setTo(day);
    }
  };

  const moveFocus = (day: string, delta: number) => {
    const [y, m, d] = day.split('-').map(Number);
    const next = new Date(Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + delta));
    const nextIso = iso(next.getUTCFullYear(), next.getUTCMonth(), next.getUTCDate());
    setFocusedDay(nextIso);
    /* Keep the focused day on screen by paging the calendar if it left. */
    const shown = [
      `${cursor.year}-${String(cursor.month + 1).padStart(2, '0')}`,
      `${second.year}-${String(second.month + 1).padStart(2, '0')}`,
    ];
    if (!shown.includes(nextIso.slice(0, 7))) {
      setCursor(shiftMonth(cursor.year, cursor.month, delta > 0 ? 1 : -1));
    }
    requestAnimationFrame(() => {
      gridRef.current?.querySelector<HTMLElement>(`[data-day="${nextIso}"]`)?.focus();
    });
  };

  const onKeyDown = (event: React.KeyboardEvent, day: string) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const delta = moves[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      moveFocus(day, delta);
      return;
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      setCursor(shiftMonth(cursor.year, cursor.month, event.key === 'PageUp' ? -1 : 1));
    }
  };

  const renderMonth = (year: number, month: number) => {
    const { daysInMonth, leading } = monthGrid(year, month);
    return (
      <div className="calendar__month" key={`${year}-${month}`}>
        <h3 className="calendar__month-label">{monthLabel(year, month)}</h3>
        <div className="calendar__weekdays" aria-hidden="true">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>
        <div className="calendar__days" role="rowgroup">
          {Array.from({ length: leading }, (_, i) => (
            <span key={`pad-${i}`} className="calendar__pad" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = iso(year, month, i + 1);
            const isStart = day === from;
            const isEnd = day === to;
            const inRange = Boolean(from && to && day > from && day < to);
            const label = new Intl.DateTimeFormat('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }).format(new Date(`${day}T00:00:00Z`));

            return (
              <button
                key={day}
                type="button"
                data-day={day}
                className="calendar__day"
                data-selected={isStart || isEnd ? 'true' : undefined}
                data-in-range={inRange ? 'true' : undefined}
                aria-pressed={isStart || isEnd || inRange}
                aria-label={
                  isStart ? `Check-in ${label}` : isEnd ? `Checkout ${label}` : label
                }
                tabIndex={day === focusedDay ? 0 : -1}
                onFocus={() => setFocusedDay(day)}
                onKeyDown={(event) => onKeyDown(event, day)}
                onClick={() => select(day)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      <div className="calendar__header">
        <button
          type="button"
          className="icon-button"
          aria-label="Previous month"
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, -1))}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <button
          type="button"
          className="icon-button"
          aria-label="Next month"
          onClick={() => setCursor(shiftMonth(cursor.year, cursor.month, 1))}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="calendar__months" ref={gridRef}>
        {renderMonth(cursor.year, cursor.month)}
        {renderMonth(second.year, second.month)}
      </div>

      <div className="calendar__footer">
        <button
          type="button"
          className="description__more"
          onClick={() => {
            setFrom(null);
            setTo(null);
          }}
        >
          Clear dates
        </button>
      </div>

      {/* Announces the range without duplicating the day buttons' own names. */}
      <p aria-live="polite" className="visually-hidden">
        {from && to
          ? `Selected ${from} to ${to}`
          : from
            ? `Check-in ${from} selected, choose a checkout date`
            : 'No dates selected'}
      </p>
    </div>
  );
}
