import React, { useState } from 'react';
import { useTable, useSortBy } from 'react-table';
import { useCalendarContext } from '~/contexts/calendarContext';
import { useLanguageContext } from '~/contexts/languageContext';
import { setContrast } from './Colors';

interface TableProps {
    columns: any[];
    data: any[];
}

interface TableRowProps {
    row: any;
    onCheckboxChange: (row: any) => void;
    selected: boolean;
}

const EventTable: React.FC<TableProps> = ({ columns, data }) => {
    const { selectedSemesterPlans, setSelectedSemesterPlans } = useCalendarContext();

    const handleCheckboxChange = (row: any) => {
        // Find the corresponding SemesterPlan based on the courseid
        const selectedSemesterPlanIndex = selectedSemesterPlans.findIndex(plan => plan.courseid === row.original.courseId);
        
        // If the SemesterPlan is not found, return early or handle the case accordingly
        if (selectedSemesterPlanIndex === -1) {
            // Handle the case where the SemesterPlan is not found
            return;
        }
    
        // Create a copy of the selected SemesterPlan
        const updatedSemesterPlan = { ...selectedSemesterPlans[selectedSemesterPlanIndex] };
    
        // Ensure that 'events' is initialized as an array
        if (!updatedSemesterPlan.events) {
            updatedSemesterPlan.events = [];
        }
    
        // Find the corresponding event in the SemesterPlan based on the event id
        const selectedEventIndex = updatedSemesterPlan.events.findIndex(event => event.id === row.original.id);
    
        // Manually toggle the selection state of the row
        const isSelected = !row.isSelected;
    
        // Modify the selected event within the SemesterPlan
        updatedSemesterPlan.events[selectedEventIndex] = {
            ...updatedSemesterPlan.events[selectedEventIndex],
            selected: isSelected,
        };
        
        // Update selectedSemesterPlans state with the modified SemesterPlan
        const updatedPlans = [...selectedSemesterPlans];
        updatedPlans[selectedSemesterPlanIndex] = updatedSemesterPlan;

        setSelectedSemesterPlans(updatedPlans);
    };

    const isSelected = (row: any) => {
        return selectedSemesterPlans.find(plan => plan.courseid === row.original.courseId)?.events.some((event) => event.actid === row.original.actid)
    }

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data }, useSortBy);

    return (
        <div className="overflow-x-auto rounded-m ">
            <table
                {...getTableProps()}
                className="w-full rounded-md bg-white text-black mt-2 mb-2"
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
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    className="border-b-2 border-black p-8 whitespace-normal overflow-auto text-left w-1/6"
                                >
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
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
                                key={row.id}
                                row={row}
                                onCheckboxChange={handleCheckboxChange}
                                selected={isSelected(row)}
                            />
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const TableRow: React.FC<TableRowProps> = ({ row, onCheckboxChange, selected }) => {
    const { getRowProps, cells } = row;

    return (
        <tr {...getRowProps()}>
            <td>
                <div className='flex items-center justify-center'>
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onCheckboxChange(row)}
                        style={{ transform: 'scale(1.5)' }} // Add this style for larger checkboxes
                    />
                </div>
            </td>
            {cells.map((cell) => (
                <td
                    {...cell.getCellProps()}
                    className="border-t-2 border-gray-500 p-8 whitespace-normal overflow-auto"
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
        courseColors,
        indexes,
    } = useCalendarContext();

    const { language } = useLanguageContext();

    const columns = language === 'no' ? [
        { Header: 'Ukedag', accessor: 'dayOfWeek' },
        { Header: 'Uke', accessor: 'weeks' },
        { Header: 'Starttid', accessor: 'startDateTime' },
        { Header: 'Sluttid', accessor: 'endDateTime' },
        { Header: 'Beskrivelse', accessor: 'eventName' },
        { Header: 'Grupper', accessor: 'groups' },
    ] : [
        { Header: 'Day of Week', accessor: 'dayOfWeek' },
        { Header: 'Weeks', accessor: 'weeks' },
        { Header: 'Start Date/Time', accessor: 'startDateTime' },
        { Header: 'End Date/Time', accessor: 'endDateTime' },
        { Header: 'Groups', accessor: 'groups' },
    ];

    const daysOfWeekNames = language === 'no' ? ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'] :
        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const labels = {
        selectedHeader: language === 'no' ? 'Valgte emner' : 'Selected Courses:',
        noSelectedCourses: language === 'no' ? 'Ingen valgte emner' : 'No selected courses',
    };

    // State to track the visibility of tables for each semesterPlan
    const [visibleTables, setVisibleTables] = useState<{ [key: string]: boolean }>({});

    const toggleTableVisibility = (courseId: string) => {
        setVisibleTables((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
    };

    return (
        <div>
            <h3>{labels.selectedHeader}</h3>
            {semesterPlans.map((semesterPlan) => {
                const eventsGroupedByEventId: Record<string, any> = {};

                semesterPlan.events.forEach((event) => {
                    const eventId = event.actid + event.dtstart.split('T')[1]?.split('+')[0];

                    if (!eventsGroupedByEventId[eventId]) {
                        eventsGroupedByEventId[eventId] = {
                            actid: event.actid,
                            courseId: semesterPlan.courseid,
                            eventName: event['teaching-method-name'],
                            startDateTime: event.dtstart.split('T')[1]?.split('+')[0].slice(0, -3),
                            endDateTime: event.dtend.split('T')[1]?.split('+')[0].slice(0, -3),
                            dayOfWeek: daysOfWeekNames[event.weekday],
                            weeks: [event.weeknr],
                            groups: Array.from(new Set(event.studentgroups.map((group) => group.split('_')[0]))).join(', '),
                        };
                    } else {
                        const currentWeek = event.weeknr;
                        if (!eventsGroupedByEventId[eventId].weeks.includes(currentWeek)) {
                            eventsGroupedByEventId[eventId].weeks.push(currentWeek);
                        }
                    }
                });

                
                const formattedWeeks = Object.values(eventsGroupedByEventId).map((event) => {
                    const weeks = event.weeks;

                    if (weeks.length === 1) {
                        return weeks[0].toString();
                    }

                    const ranges = [];
                    let start = weeks[0];
                    let end = weeks[0];

                    for (let i = 1; i < weeks.length; i++) {
                        if (weeks[i] === weeks[i - 1] + 1) {
                            end = weeks[i];
                        } else {
                            ranges.push(end !== start ? `${start}-${end}` : start.toString());
                            start = end = weeks[i];
                        }
                    }

                    ranges.push(end !== start ? `${start}-${end}` : start.toString());

                    return ranges.join(', ');
                });

                const filteredEvents = Object.values(eventsGroupedByEventId).map((event, index) => ({
                    ...event,
                    weeks: formattedWeeks[index],
                })).sort((a, b) => {
                    const dayComparison = daysOfWeekNames.indexOf(a.dayOfWeek) - daysOfWeekNames.indexOf(b.dayOfWeek);
                    if (dayComparison !== 0) {
                        return dayComparison;
                    }
                });

                const index = indexes[semesterPlan.courseid];
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

                            <a
                                className='rounded-md ml-2'
                                href={`https://www.ntnu.no/studier/emner/${semesterPlan.courseid}#tab=omEmnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                                </svg>
                            </a>
                        </div>
                        {visibleTables[semesterPlan.courseid] && (
                            Object.keys(eventsGroupedByEventId).length !== 0 ? (
                                <EventTable columns={columns} data={filteredEvents} />
                            ) : (
                                <div>No subjects found</div>
                            )
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ModifyCourses;
