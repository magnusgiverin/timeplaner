import type { SemesterPlan, Event as MyEvent } from '~/interfaces/SemesterPlanData';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { Formats } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment-timezone';
import { setContrast } from './Colors';

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

interface ParsedEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  details: MyEvent;
}

function parseDate(dateString: string): Date {
  const [datePart, timeWithOffset] = dateString.split('T');

  if (!datePart || !timeWithOffset) {
    throw new Error('Invalid date string format');
  }

  const [year, month, day] = datePart.split('-');
  const [time, offset] = timeWithOffset.split(/[-+]/); // Split the date and offset using either + or -

  if (!year || !month || !day || !time || !offset) {
    throw new Error('Invalid date string format');
  }

  const [hours, minutes] = time.split(':');
  const offsetHours = timeWithOffset.includes('-') ? -parseInt(offset) : parseInt(offset);

  if (!hours || !minutes || isNaN(offsetHours)) {
    throw new Error('Invalid date string format');
  }

  // Adjust date and time based on the offset
  const date = moment.tz(dateString, 'Europe/Oslo').toDate();

  return date;
}

function parseSemesterPLans(semesterPlans: SemesterPlan[], indexes: Record<string, number>): ParsedEvent[] {
  const events: ParsedEvent[] = [];

  semesterPlans.map((semesterPlan) => semesterPlan.events.map((event) => {
    const parsedEvent = {
      id: indexes[event.courseid] ?? 0,
      title: `${semesterPlan.courseid} - ${semesterPlan.coursename}`,
      start: parseDate(event.dtstart),
      end: parseDate(event.dtend),
      allDay: false,
      details: event
    }

    events.push(parsedEvent);
  }));

  return events;
}

interface CalendarDisplayProps {
  selectedSemesterPlans: SemesterPlan[]; // Replace with your actual type
  indexes: Record<string, number>;
  courseColors: Record<string, string>; // Replace with your actual type
}

const CalendarDisplay: React.FC<CalendarDisplayProps> = ({
  selectedSemesterPlans,
  indexes,
  courseColors,
}) => {

  const timezone = moment.tz.guess();
  moment.tz.setDefault(timezone);

  const localizer = momentLocalizer(moment);
  const parsedEvents = parseSemesterPLans(selectedSemesterPlans, indexes);

  const today = new Date();
  const defaultDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);
  const timeZoneOffset = new Date().toLocaleString("en-US", { timeZoneName: "short", timeZone: timezone }) ?? '+00:00';

  const workWeekStart = new Date();
  workWeekStart.setHours(7, 0, 0, 0);
  workWeekStart.setHours(workWeekStart.getHours() - parseInt(timeZoneOffset.split(":")[0] ?? "0"));

  const workWeekEnd = new Date();
  workWeekEnd.setHours(19, 0, 0, 0);
  workWeekEnd.setHours(workWeekEnd.getHours() - parseInt(timeZoneOffset.split(":")[0] ?? "0"));

  const eventPropGetter = (event: ParsedEvent) => {
    const courseCode = event.title?.split('-')[0]?.trim();
    if (courseCode) {
      const backgroundColor = courseColors[indexes[courseCode]!];

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

  const formats: Formats = {
    dateFormat: 'dd',
    dayFormat: (date, culture, localizer) => localizer?.format(date, 'ddd', culture) ?? '',
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) => {
      const formattedStart = localizer?.format(moment(start).toDate(), 'ddd MMM D', culture) ?? '';
      const formattedEnd = localizer?.format(moment(end).toDate(), 'ddd MMM D', culture) ?? '';

      return `${formattedStart} — ${formattedEnd}`;
    },
    timeGutterFormat: (date, culture, localizer) => localizer?.format(date, 'HH:mm', culture) ?? '',
    eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
      `${localizer?.format(moment(start).toDate(), 'HH:mm', culture) ?? ''} — ${localizer?.format(moment(end).toDate(), 'HH:mm', culture) ?? ''}`
  };

  const handleSelectEvent = (event: ParsedEvent) => {
    const details = event.details;
    // Add your logic to show more details of the selected event
    const title = event.title;

    const staffDetails = details.staffs?.map(staff => `${staff.shortname} (${staff.id}@ntnu.no)`).join(', ');
    const summary = details.summary ? `Summary: ${details['teaching-title']}` : '';
    const staffInfo = staffDetails ? `Staff: ${staffDetails}` : '';
    const room = "Room: " + details.room?.[0]?.roomname ?? ""

    const eventDetails = [title, summary, staffInfo, room].filter(Boolean).join('\n\n');
    alert(eventDetails)
  };

  return (
    <div className='flex-column flex-row flex-shrink mt-2 mb-2 justify-center'>
      <div className="h-[60vh]">
        <style>
          {`
          .rbc-allday-cell {
            display: none;
          }
          .rbc-time-view .rbc-header {
            border-bottom: none;
          }
        `}
        </style>
        <Calendar
          formats={formats}
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
          className="bg-white text-black border border-gray-300 rounded-md p-2"
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  );
};

export default CalendarDisplay;
