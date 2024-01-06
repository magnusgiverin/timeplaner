import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment-timezone';
import { generateColor, setContrast } from './Colors';

interface IcsCalendarProps {
  icsFileContent: string;
  indexes: Record<string, number>;
}

export const hashString = (str: string) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
};

/// Helper function to parse ICS date format
function parseIcsDate(icsDate: string) {
  const year = parseInt(icsDate.slice(0, 4));
  const month = parseInt(icsDate.slice(4, 6)) - 1; // Months are 0-indexed in JavaScript
  const day = parseInt(icsDate.slice(6, 8));
  const hours = parseInt(icsDate.slice(9, 11));
  const minutes = parseInt(icsDate.slice(11, 13));

  // Use the Norwegian time zone (+01:00)
  const date = new Date(year, month, day, hours, minutes);
  const offset = 60; // Offset in minutes
  date.setMinutes(date.getMinutes() + offset);

  return date;
}

interface ParsedEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
}

interface ICSEvent {
  id: number;
  summary: string;
  dtstart: string;
  dtend: string;
}

function parseIcsFileContent(icsFileContent: string, indexes: Record<string, number>): ParsedEvent[] {
  const lines: string[] = icsFileContent.split('\n');
  let isEvent = false;
  const events: ParsedEvent[] = [];
  let currentEvent: Partial<ICSEvent> = {};

  lines.forEach((line: string) => {
    if (line.startsWith('BEGIN:VEVENT')) {
      isEvent = true;
      currentEvent = {}; // Reset currentEvent for a new event
    } else if (line.startsWith('END:VEVENT')) {
      isEvent = false;
      if (currentEvent.summary && currentEvent.id !== undefined) {
        events.push({
          id: currentEvent.id,
          title: currentEvent.summary,
          start: parseIcsDate(currentEvent.dtstart!),
          end: parseIcsDate(currentEvent.dtend!),
          allDay: false,
        });
      }
    } else if (isEvent) {
      const [key, value] = line.split(':');
      if (key && value) {
        if (key === 'SUMMARY') {
          const summary: string = value.replace('\r', '');
          const splitSummary: string[] = summary.split("-");
          const courseCode: string = splitSummary[0]?.trim() ?? "";
          currentEvent.summary = summary;
          currentEvent.id = indexes[courseCode];
        } else if (key === 'DTSTART') {
          currentEvent.dtstart = value;
        } else if (key === 'DTEND') {
          currentEvent.dtend = value;
        }
      }
    }
  });

  return events;
}

const IcsCalendar: React.FC<IcsCalendarProps> = ({ icsFileContent, indexes }) => {
  moment.tz.setDefault('America/Godthab');
  const localizer = momentLocalizer(moment);
  const parsedEvents = parseIcsFileContent(icsFileContent, indexes);
  const today = new Date();
  const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);

  const workWeekStart = new Date();
  workWeekStart.setHours(9, 0, 0, 0);

  const workWeekEnd = new Date();
  workWeekEnd.setHours(23, 0, 0, 0);

  const uniqueEventTitles = [...new Set(parsedEvents.map(event => event.id))];
  const eventColors = generateColor(uniqueEventTitles.length);

  const eventPropGetter = (event: ParsedEvent) => {
    const courseCode = event.title?.split('-')[0]?.trim();

    if (courseCode) {
      const backgroundColor = eventColors[indexes[courseCode]!];

      // Check if backgroundColor is defined before calling setContrast
      const textColor = backgroundColor ? setContrast(backgroundColor) : '';

      return {
        style: {
          border: '1px solid white',
          outline: `1px solid white`, // Set the outer border with the background color 
          backgroundColor,
          color: textColor, // Set the text color
        },
      };
    }

    return {}
  }

  return (
    <div>
      <Calendar
        defaultView='work_week'
        defaultDate={defaultDate}
        localizer={localizer}
        events={parsedEvents}
        startAccessor="start"
        endAccessor="end"
        views={{
          month: false,
          week: true,
          work_week: true,
          day: true,
          agenda: false,
        }}
        min={workWeekStart}
        max={workWeekEnd}
        className="bg-white text-black border border-gray-300 rounded-md p-2 m-1"
        eventPropGetter={eventPropGetter}
      />
    </div>
  );
};

export default IcsCalendar;