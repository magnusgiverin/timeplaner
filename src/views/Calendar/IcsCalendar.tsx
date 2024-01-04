import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment-timezone';
import { RGBColor, lab } from 'd3-color';

interface IcsCalendarProps {
  icsFileContent: string;
}

const hashString = (str: string) => {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash;
};

export const generateColor = (str: string) => {
  const colorId = Math.abs(hashString(str));

  const cielabColor = lab(
    ((colorId % 100) + 100) % 100,
    Math.max(Math.min((colorId * 3.272014841214069) % 160 - 50, 80), -80),
    160 - Math.max(Math.min((colorId * 1.618033988749895) % 160 - 50, 80), -80)
  );

  // Convert CIELAB to RGB
  const rgbColor = cielabColor.rgb();

  // Directly use the rgbColor string as the background color
  return rgbColor.toString();
};

function parseIcsFileContent(icsFileContent: string) {
    const ICAL = require('ical.js');

    const jcalData = ICAL.parse(icsFileContent);
    const comp = new ICAL.Component(jcalData);

    // Assuming that vevents are directly accessible at index 2, adjust this according to your file structure
    const veventComponents = comp.jCal[2];

    if (!veventComponents || !Array.isArray(veventComponents)) {
        throw new Error('Invalid ICS file format');
    }

    const events = veventComponents.map((vevent: any) => {
        const summary = vevent[1].find((prop: any) => prop[0] === 'summary')?.[3]?.replace('Title: ', '') || '';
        const dtstartProp = vevent[1].find((prop: any) => prop[0] === 'dtstart');
        const dtendProp = vevent[1].find((prop: any) => prop[0] === 'dtend');
    
        const dtstart = dtstartProp ? new Date(dtstartProp[3]) : null;
        const dtend = dtendProp ? new Date(dtendProp[3]) : null;
    
        let dtstartWithTimeZone = null;
        let dtendWithTimeZone = null;
    
        if (dtstart) {
            dtstartWithTimeZone = new Date(
                dtstart.toLocaleString('en-US', { timeZone: 'Europe/Oslo' })
            );
        }
    
        if (dtend) {
            dtendWithTimeZone = new Date(
                dtend.toLocaleString('en-US', { timeZone: 'Europe/Oslo' })
            );
        }
    
        // Generate ID based on the event name
        const id = hashString(summary);
    
        return {
            id: id,
            title: summary,
            start: dtstartWithTimeZone,
            end: dtendWithTimeZone,
            allDay: false,
        };
    });
    
    return events;
}

const IcsCalendar: React.FC<IcsCalendarProps> = ({ icsFileContent }) => {
    moment.tz.setDefault('America/Godthab');
    const localizer = momentLocalizer(moment);
    const parsedEvents = parseIcsFileContent(icsFileContent);
  
    const today = new Date();
    const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);
  
    const workWeekStart = new Date();
    workWeekStart.setHours(9, 0, 0, 0);
  
    const workWeekEnd = new Date();
    workWeekEnd.setHours(23, 0, 0, 0);
  
    const eventPropGetter = (event: any) => {
      const backgroundColor = generateColor(event.title);
  
      return {
        style: {
            border: '2px solid white', // Set the inner border with white color 
            outline: `6px solid ${backgroundColor}`, // Set the outer border with the background color 
          },
      };
    };
  
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