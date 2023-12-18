import sqlite3
import json 

# Connect to the SQLite database (creates a new one if it doesn't exist)
conn = sqlite3.connect('prisma/db.sqlite')

# Create a cursor object to execute SQL queries
cursor = conn.cursor()

# Clear the Program table
cursor.execute('DELETE FROM Program')

# Open the JSON file for reading
with open('prisma/db/programs.json', 'r') as json_file:
    # Load the JSON data from the file
    programs = json.load(json_file)

for program in programs:
    # Insert the data into the Program table
    cursor.execute('''
        INSERT INTO Program (programId, disp_name, name, study_level)
        VALUES (:id, :disp_name, :name, :studylevel)
    ''', program)

# Commit the changes for the Program table
conn.commit()
# Clear the Course table
cursor.execute('DELETE FROM Course')

# Open the JSON file for reading
with open('prisma/db/courses.json', 'r') as json_file:
    # Load the JSON data from the file
    courses = json.load(json_file)

for course in courses:
    # Check if the course already exists
    cursor.execute("SELECT COUNT(*) FROM Course WHERE courseId = :id", {"id": course["id"]})
    existing_count = cursor.fetchone()[0]

    if existing_count == 0:
        # Insert the data into the Course table
        cursor.execute('''
            INSERT INTO Course (
                courseId,
                name,
                ownerid,
                showtype,
                detailtype,
                name_en,
                name_nn,
                coursetype,
                tpsort,
                showdiscipline,
                campusid,
                yearfrom_und,
                seasonfrom_und,
                yearto_und,
                seasonto_und,
                yearfrom_ex,
                seasonfrom_ex,
                yearto_ex,
                seasonto_ex,
                departmentid_secondary,
                create_activity_zoom,
                authorized_netgroups,
                tpn_copy_daytime,
                nofterms,
                terminnr,
                fullname,
                fullname_en,
                fullname_nn,
                idtermin
            )
            VALUES (
                :id,
                :name,
                :ownerid,
                :showtype,
                :detailtype,
                :name_en,
                :name_nn,
                :coursetype,
                :tpsort,
                :showdiscipline,
                :campusid,
                :yearfrom_und,
                :seasonfrom_und,
                :yearto_und,
                :seasonto_und,
                :yearfrom_ex,
                :seasonfrom_ex,
                :yearto_ex,
                :seasonto_ex,
                :departmentid_secondary,
                :create_activity_zoom,
                :authorized_netgroups,
                :tpn_copy_daytime,
                :nofterms,
                :terminnr,
                :fullname,
                :fullname_en,
                :fullname_nn,
                :idtermin
            )
        ''', course)

# Commit the changes for the Course table
conn.commit()

# Close the connection
conn.close()
