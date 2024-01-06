import type { SemesterPlan, Event } from '~/interfaces/SemesterPlanData';
import * as ics from 'ics';
import type { EventAttributes } from 'ics';

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
    const [time, offset] = timeWithOffset.split('+');

    if (!year || !month || !day || !time || !offset) {
        throw new Error('Invalid date string format');
    }

    const [hours, minutes] = time.split(':');
    const offsetHours = parseInt(offset);

    if (!hours || !minutes || isNaN(offsetHours)) {
        throw new Error('Invalid date string format');
    }

    // Adjust date and time based on the offset
    const adjustedDate = new Date(Date.UTC(
        parseInt(year),
        parseInt(month) - 1, // Months are 0-indexed
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
    ));

    // Adjust the date based on the offset
    adjustedDate.setHours(adjustedDate.getHours() + offsetHours);

    // Get the timezone abbreviation for the offset
    const offsetTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Create a new date in the timezone for the offset
    const adjustedDateInTimezone = new Date(adjustedDate.toLocaleString('en-US', { timeZone: offsetTimezone }));

    return adjustedDateInTimezone;
}

function generateDescription(event: Event, title: string): string {
    const staffDetails = event.staffs?.map(staff => `${staff.shortname} (${staff.id}@ntnu.no)`).join(', ');
    const summary = event.summary ? `Summary: ${event.summary}` : '';
    const staffInfo = staffDetails ? `Staff: ${staffDetails}` : '';

    return [title, summary, staffInfo].filter(Boolean).join('\n\n');
}

function generateICal(semesterPlans: SemesterPlan[]): string {
    const icalEvents: EventAttributes[] = [];  // Rename to avoid conflict with the duplicate declaration

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