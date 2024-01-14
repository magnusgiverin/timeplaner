import type { SemesterPlan, Event } from '~/interfaces/SemesterPlanData';
import * as ics from 'ics';
import type { EventAttributes } from 'ics';
import moment from 'moment';

function downloadICal(content: string, filename: string) {
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/calendar' });
  
    // Create a link element
    const link = document.createElement('a');
  
    // Set the link's href to a data URL representing the Blob
    link.href = window.URL.createObjectURL(blob);
  
    // Set the link's download attribute to the filename
    link.download = filename;
  
    // Open Google Calendar with the iCal file's URL
    window.open('http://www.google.com/calendar/render?cid=' + link.href);
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

function generateDescription(event: Event, title: string): string {
    const staffDetails = event.staffs?.map(staff => `${staff.shortname} (${staff.id}@ntnu.no)`).join(', ');
    const summary = event.summary ? `Summary: ${event['teaching-title']}` : '';
    const staffInfo = staffDetails ? `Staff: ${staffDetails}` : '';

    const roomUrl = event.room?.[0]?.roomurl ?? '';
    const isUrlValid = /^https?:\/\/\S+$/.test(roomUrl);
    const mazeMapLink = isUrlValid ? "Room: " + roomUrl : ''

    return [title, summary, staffInfo, mazeMapLink].filter(Boolean).join('\n\n');
}

function generateICal(semesterPlans: SemesterPlan[]): string {
    const icalEvents: EventAttributes[] = [];  // Rename to avoid conflict with the duplicate declaration

    for (const semesterPlan of semesterPlans) {
        for (const event of semesterPlan.events) {
            const startDate = parseDate(event.dtstart);
            const endDate = parseDate(event.dtend);

            const roomName = event.room?.[0]?.roomname ?? '';

            const title = `${semesterPlan.courseid} - ${semesterPlan.coursename}`;

            icalEvents.push({
                start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), startDate.getHours(), startDate.getMinutes()],
                end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), endDate.getHours(), endDate.getMinutes()],
                title: title,
                description: generateDescription(event, title),
                categories: event.studentgroups,
                status: 'CONFIRMED',
                busyStatus: 'BUSY',
                ...(roomName !== '' ? { location: roomName } : {}),
            });
        }
    }

    const { error, value } = ics.createEvents(icalEvents);

    if (error) {
        console.error('Error generating iCalendar events:', error);
        return "";
    }

    return value ?? "";;
}

export { generateICal, downloadICal };