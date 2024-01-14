import React, { useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { useCalendarContext } from '~/contexts/calendarContext';
import { useLanguageContext } from '~/contexts/languageContext';
import { setContrast } from './Colors';
import moment from 'moment';
import type { Event as MyEvent } from '~/interfaces/SemesterPlanData';
import { useMedia } from 'react-use';

interface TableProps {
    columns: Column[];
    data: Row[];
}

interface Column {
    Header: string;
    accessor: keyof Row; // This assumes accessor should be a key of the Row interface
}

interface Row {
    eventId: string;
    courseId: string;
    eventName: string;
    startDateTime?: string;
    endDateTime?: string;
    dayOfWeek: string;
    weeks?: string[];  // Update the type here
    groups?: string;
}

const getUniqueId = (event: MyEvent, language: string, isSmallScreen: boolean) => {

    const daysOfWeekNames = language === 'no'
        ? ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Conditionally update day names for smaller screens
    const shortDaysOfWeekNames = isSmallScreen
        ? daysOfWeekNames.map(day => day.slice(0, 3))
        : daysOfWeekNames;

    return event.actid + event.dtstart.split('T')[1]?.split('+')[0] + shortDaysOfWeekNames[event.weekday] ?? "-"
}

const EventTable: React.FC<TableProps> = ({ columns, data }) => {
    const { selectedSemesterPlans, setSelectedSemesterPlans, semesterPlans } = useCalendarContext();
    const { language } = useLanguageContext();

    const isSmallScreen = useMedia('(max-width: 600px)'); // Adjust the maximum width as needed

    const isSelected = (courseId: string, eventId: string) => {
        return selectedSemesterPlans.find(plan => plan.courseid === courseId)?.events.some((event) => getUniqueId(event, language, isSmallScreen) === eventId)
    };

    const handleCheckboxChange = (row: { original: { eventId: string; courseId: string } }) => {
        const { eventId, courseId } = row.original;

        // Create a new array of selectedSemesterPlans
        const updatedPlans = selectedSemesterPlans.map((semesterPlan) => {
            if (semesterPlan.courseid === courseId) {
                // Check if the row is selected or not
                if (isSelected(courseId, eventId)) {
                    // If selected, filter out the event with actid equal to row.original.actid
                    const updatedEvents = semesterPlan.events.filter((event) => getUniqueId(event, language, isSmallScreen) !== eventId);
                    return {
                        ...semesterPlan,
                        events: updatedEvents,
                    };
                } else {
                    const selectedEvents = semesterPlans
                        .filter((plan) => plan.courseid === courseId) // Filter the semesterPlans for the same courseId
                        .flatMap((plan) =>
                            plan.events.filter(
                                (event) =>
                                    getUniqueId(event, language, isSmallScreen) === eventId
                            )
                        );

                    return {
                        ...semesterPlan,
                        events: [...semesterPlan.events, ...selectedEvents],
                    };
                };
            }
            // Return the semesterPlan as is for other courses
            return semesterPlan;
        });

        setSelectedSemesterPlans(updatedPlans);
    };

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <div className="overflow-x-auto rounded-md">
            <table
                {...getTableProps()}
                className={`w-full rounded-md bg-white text-black mt-2 mb-2`}
            >
                <thead>
                    {headerGroups.map((headerGroup) => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            <th
                                className="p-8 whitespace-normal overflow-auto text-left"
                            >
                            </th>
                            {headerGroup.headers.map((column) => (
                                <th
                                    className={`border-b-2 border-black p-3 whitespace-normal overflow-auto text-left w-${isSmallScreen ? '1/4' : '1/6'}`}
                                >
                                    {column.render('Header')}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                        prepareRow(row);
                        return (
                            <TableRow
                                key={row.original.courseId + row.id}
                                row={row}
                                onCheckboxChange={handleCheckboxChange}
                                selected={isSelected(row.original.courseId, row.original.eventId)}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

interface TableRowStructure {
    cells: {
        getCellProps: (cellProps?: Record<string, unknown>) => React.HTMLProps<HTMLTableCellElement>;
        render: (text: string) => React.ReactNode; // Adjust the return type based on what your component renders
    }[];
    getRowProps: (userProps?: Record<string, unknown>) => React.HTMLProps<HTMLTableRowElement>;
    original: Row;
    // Add other properties or methods as needed
}

interface RowProps {
    row: TableRowStructure;
    onCheckboxChange: (row: TableRowStructure) => void;
    selected?: boolean;
}

const TableRow: React.FC<RowProps> = ({ row, onCheckboxChange, selected }) => {
    const { getRowProps, cells } = row;
    return (
        <tr {...getRowProps()}>
            <td>
                <div className='flex items-center justify-center'>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onCheckboxChange(row)}
                        style={{ transform: 'scale(1.5)' }} 
                    />
                </div>
            </td>
            {cells.map((cell) => (
                <td
                    {...(cell.getCellProps() as {
                        key?: React.Key;
                        onClick?: (event: React.MouseEvent) => void;
                        // Add other properties as needed based on your use case
                    })}
                    className="border-t-2 border-gray-500 p-3 whitespace-normal overflow-auto"
                >
                    {cell.render('Cell')}
                </td>
            ))}
        </tr>
    );
};

const ModifyCourses: React.FC = () => {
    const {
        semesterPlans,
        selectedSemesterPlans,
        courseColors,
        indexes,
    } = useCalendarContext();

    const { language } = useLanguageContext();

    const isSmallScreen = useMedia('(max-width: 600px)'); // Adjust the maximum width as needed

    const columns: Column[] = language === 'no' ? [
        { Header: 'Ukedag', accessor: 'dayOfWeek' as keyof Row },
        { Header: 'Starttid', accessor: 'startDateTime' as keyof Row },
        { Header: 'Sluttid', accessor: 'endDateTime' as keyof Row },
        { Header: 'Beskrivelse', accessor: 'eventName' as keyof Row },
        ...(isSmallScreen ? [] : [
            { Header: 'Uke', accessor: 'weeks' as keyof Row },
        ]),
        { Header: 'Grupper', accessor: 'groups' as keyof Row },
    ] : [
        { Header: 'Day of Week', accessor: 'dayOfWeek' as keyof Row },
        { Header: 'Start Time', accessor: 'startDateTime' as keyof Row },
        { Header: 'End Time', accessor: 'endDateTime' as keyof Row },
        { Header: 'Description', accessor: 'eventName' as keyof Row },
        ...(isSmallScreen ? [] : [
            { Header: 'Weeks', accessor: 'weeks' as keyof Row },
        ]),
        { Header: 'Groups', accessor: 'groups' as keyof Row },
    ];    

    if (isSmallScreen) {
        columns.forEach(column => {
            if (column.Header === 'Ukedag') column.Header = 'Dag';
            else if (column.Header === 'Starttid') column.Header = 'Start';
            else if (column.Header === 'Sluttid') column.Header = 'Slutt';
            if (column.Header === 'Day of Week') column.Header = 'Day';
            else if (column.Header === 'Start Time') column.Header = 'Start';
            else if (column.Header === 'End Time') column.Header = 'End';
        });
    }

    const daysOfWeekNames = language === 'no'
        ? ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Conditionally update day names for smaller screens
    const shortDaysOfWeekNames = isSmallScreen
        ? daysOfWeekNames.map(day => day.slice(0, 3))
        : daysOfWeekNames;

    const labels = {
        selectedHeader: language === 'no' ? 'Rediger emner:' : 'Modify Courses:',
        noSelectedCourses: language === 'no' ? 'Ingen valgte emner' : 'No selected courses',
    };

    // State to track the visibility of tables for each semesterPlan
    const [visibleTables, setVisibleTables] = useState<Record<string, boolean>>({});

    const toggleTableVisibility = (courseId: string) => {
        setVisibleTables((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
    };

    return (
        <div>
            <h3>{labels.selectedHeader}</h3>
            {semesterPlans.map((semesterPlan) => {
                const eventsGroupedByEventId: Record<string, Row> = {};

                semesterPlan.events.forEach((event) => {
                    const eventId = getUniqueId(event, language, isSmallScreen);

                    if (!eventsGroupedByEventId[eventId]) {
                        const startDateTime = event.dtstart ? moment(event.dtstart).format('HH:mm') : '';
                        const endDateTime = event.dtend ? moment(event.dtend).format('HH:mm') : '';

                        const groups = Array.from(new Set(event.studentgroups.map((group) => group.split('_')[0]))).join(', ');

                        eventsGroupedByEventId[eventId] = {
                            eventId: eventId,
                            courseId: semesterPlan.courseid,
                            eventName: event['teaching-title'] ?? "-", // provide a default value if necessary
                            startDateTime: startDateTime ?? "", // provide a default value if necessary
                            endDateTime: endDateTime ?? "", // provide a default value if necessary
                            dayOfWeek: shortDaysOfWeekNames[event.weekday] ?? "-", // provide a default value if necessary
                            weeks: [String(event.weeknr)],
                            groups: groups || "-", // Display "-----" if groups is empty
                        };
                    } else {
                        const currentWeek = String(event.weeknr);
                        const events = eventsGroupedByEventId[eventId];
                        if (events?.weeks) {
                            const condition = !events.weeks.includes(currentWeek);
                            if (condition) {
                                events.weeks.push(currentWeek);
                            }
                        }
                    }
                });

                const formattedWeeks = Object.values(eventsGroupedByEventId).map((event) => {
                    const weeks = event.weeks;

                    if (weeks?.length === 1) {
                        return Number(weeks[0]);  // Convert to number
                    }

                    if (weeks && weeks.length > 1) {
                        const ranges = [];

                        let start = Number(weeks[0]);  // Convert to number
                        let end = Number(weeks[0]);    // Convert to number

                        for (let i = 1; i < weeks.length; i++) {
                            const week1 = Number(weeks[i]);
                            const week2 = Number(weeks[i - 1]) ?? 0;

                            if (week1 === week2 + 1) {
                                end = week1;
                            } else {
                                ranges.push(end !== start ? `${start}-${end}` : start?.toString());
                                start = end = week1;
                            }
                        }

                        ranges.push(end !== start ? `${start}-${end}` : start?.toString());

                        return ranges.length > 0 ? ranges : undefined;
                    }

                    return undefined;
                });


                function isUseless(eventsGroupedByEventId: Record<string, Row>) {
                    return Object.keys(eventsGroupedByEventId).every((eventId) =>
                        selectedSemesterPlans.find((plan) => plan.courseid === eventsGroupedByEventId[eventId]?.courseId)?.events.every((event) =>
                            getUniqueId(event, language, isSmallScreen) !== eventId
                        )
                    );
                }

                const filteredEvents: Row[] = Object.values(eventsGroupedByEventId).map((event, index) => ({
                    ...event,
                    weeks: formattedWeeks[index] ? String(formattedWeeks[index]).split(', ') : undefined,
                })).sort((a, b) => {
                    const dayComparison = daysOfWeekNames.indexOf(a.dayOfWeek) - daysOfWeekNames.indexOf(b.dayOfWeek);
                    if (dayComparison !== 0) {
                        return dayComparison;
                    }

                    // Check if startTime is undefined and handle accordingly
                    if (!a.startDateTime && !b.startDateTime) {
                        return 0;  // No difference in start time, treat as equal
                    } else if (!a.startDateTime) {
                        return 1;  // `a` comes after `b` if `a` has undefined start time
                    } else if (!b.startDateTime) {
                        return -1;  // `a` comes before `b` if `b` has undefined start time
                    }

                    // Compare start times
                    return a.startDateTime.localeCompare(b.startDateTime);
                });

                const index = indexes[semesterPlan.courseid] ?? 0;
                const color = courseColors[index];
                const textColor = color ? setContrast(color) : '';

                return (
                    <div key={semesterPlan.courseid}>
                        <div className="flex items-center">
                            <div
                                className="inline-block p-2 mt-2 mb-2 rounded-md text-decoration-none flex items-center "
                                style={{
                                    ...(courseColors && {
                                        backgroundColor: color,
                                        borderColor: textColor,
                                    }),
                                    color: textColor,
                                }}
                            >
                                <span className="ml-2 mr-2">{semesterPlan.courseid + ": " + semesterPlan.coursename}</span>
                            </div>

                            {visibleTables[semesterPlan.courseid] ? (
                                <a
                                    className="rounded-md transition duration-300 ease-in-out hover:bg-blue-500 ml-2"
                                    onClick={() => toggleTableVisibility(semesterPlan.courseid)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m6 18L18 6M6 6l12 12" />
                                    </svg>
                                </a>
                            ) : (
                                <a
                                    className="rounded-md transition duration-300 ease-in-out hover:bg-blue-500 ml-2"
                                    onClick={() => toggleTableVisibility(semesterPlan.courseid)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </a>
                            )}
                            {isUseless(eventsGroupedByEventId) && (
                                <a
                                    className="rounded-md transition duration-300 ease-in-out hover:bg-red-500 ml-2"
                                    onClick={() => toggleTableVisibility(semesterPlan.courseid)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                </a>
                            )}
                            <a
                                className='rounded-md transition duration-300 ease-in-out hover:bg-green-500 ml-2'
                                href={`https://www.ntnu.no/studier/emner/${semesterPlan.courseid}#tab=omEmnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                            </a>
                        </div>
                        {
                            visibleTables[semesterPlan.courseid] && (
                                Object.keys(eventsGroupedByEventId).length !== 0 ? (
                                    <EventTable columns={columns} data={filteredEvents} />
                                ) : (
                                    <div>{language === "no" ? "Ingenting funnet" : "No events found"}</div>
                                )
                            )
                        }
                    </div>
                );
            })}
        </div >
    );
};

export default ModifyCourses;
