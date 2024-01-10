import type { SemesterPlan, Event } from '~/interfaces/SemesterPlanData';
import * as ics from 'ics';
import type { EventAttributes } from 'ics';
import moment from 'moment';

function downloadICal(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
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
    const summary = event.summary ? `Summary: ${event.summary}` : '';
    const staffInfo = staffDetails ? `Staff: ${staffDetails}` : '';

    return [title, summary, staffInfo].filter(Boolean).join('\n\n');
}

function generateICal(semesterPlans: SemesterPlan[]): string {
    const icalEvents: EventAttributes[] = [];  // Rename to avoid conflict with the duplicate declaration

    console.log(semesterPlans);
    for (const semesterPlan of semesterPlans) {
        for (const event of semesterPlan.events) {
            const startDate = parseDate(event.dtstart);
            const endDate = parseDate(event.dtend);

            const roomName = event.room?.[0]?.roomname ?? '';
            const roomUrl = event.room?.[0]?.roomurl ?? '';
            const isUrlValid = /^https?:\/\/\S+$/.test(roomUrl);

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
                ...(isUrlValid ? { url: roomUrl } : {}),
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