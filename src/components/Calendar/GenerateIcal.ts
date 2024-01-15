import type { SemesterPlan, Event } from '~/interfaces/SemesterPlanData';
import * as ics from 'ics';
import type { EventAttributes } from 'ics';
import moment from 'moment';
import { put } from "@vercel/blob";
import { useAppContext } from '~/contexts/appContext';

function saveIcal(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/calendar' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

async function downloadICal(content: string, filename: string) {
    const { season } = useAppContext();
    
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/calendar' });
    const currentYearLastDigits = new Date().getFullYear().toString().slice(-2);
    const currentSemester = `${currentYearLastDigits}${season === 'Spring' ? 'v' : 'h'}`;

    const filePath = "ics/" + currentSemester + "/"

    const { url } = await put(filePath + filename, blob, { access: 'public', token: "vercel_blob_rw_Z3DZJ7HZqZpz7qY4_NE83hjbh90VXg6Uv5YDGNoL2N9wlkA"});

    // Open Google Calendar with the link to the saved ICS file
    window.open(`https://www.google.com/calendar/render?cid=webcal://${url}`);
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

function generateICal(semesterPlans: SemesterPlan[], filename: string): string {
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

    const icsContent = value ?? "";
    const icsWithCalName = `X-WR-CALNAME:${filename}\n${icsContent}`;

    return icsWithCalName;
}

export { generateICal, downloadICal, saveIcal };