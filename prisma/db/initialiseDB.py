import requests
import json 
import sqlite3

def updatePrograms():
    data_dict = {"en": {}, "no": {}}
    
    # URL for the English cURL request
    url_en = "https://www.ntnu.edu/web/studies/allstudies?p_p_id=studyprogrammelistportlet_WAR_studyprogrammelistportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=searchStudies&p_p_cacheability=cacheLevelPage"
    # Perform cURL request for English
    response_en = requests.get(url_en)

    if response_en.status_code == 200:
        data_dict["en"] = response_en.json()
        print("English data saved to 'programs.json'")
    else:
        print(f"Failed to fetch English data. Status code: {response_en.status_code}")

    # URL for the Norwegian cURL request
    url_no = "https://www.ntnu.no/web/studier/alle?p_p_id=studyprogrammelistportlet_WAR_studyprogrammelistportlet&p_p_lifecycle=2&p_p_state=normal&p_p_mode=view&p_p_resource_id=searchStudies&p_p_cacheability=cacheLevelPage"
    
    # Perform cURL request for Norwegian
    response_no = requests.get(url_no)
    
    # Check if the request was successful (status code 200)
    if response_no.status_code == 200:
        data_dict["no"] = response_no.json()
        print("Norwegian data saved to 'programs.json'")
    else:
        print(f"Failed to fetch Norwegian data. Status code: {response_no.status_code}")

    # Save the response content to a JSON file
    with open("prisma/db/programs.json", "w", encoding="utf-8") as file:
        json.dump(data_dict, file, indent=2, ensure_ascii=False)

def updateCourses():
    import requests
    import re
    import json

    url = "https://tp.educloud.no/ntnu/timeplan/emner.php"

    # Make a GET request
    response = requests.get(url)

    # Parse the "courses" variable from the response content using regular expressions
    matches = re.search(r'var courses = (\[.*?\]);', response.text, re.DOTALL)

    if matches:
        # Extracted content of the "courses" variable
        courses_data = matches.group(1)

        # Convert the string to a Python object (list of dictionaries)
        courses_list = json.loads(courses_data)

        # Save the JSON data to a file
        with open("prisma/courses.json", "w") as json_file:
            json.dump(courses_list, json_file, indent=2)

        print("Courses Data saved to 'courses.json'")
    else:
        print("No matches found")

def initialisePrograms():
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

    for language in programs:
        for program in programs[language]["docs"]:
            # Insert the data into the Program table
            cursor.execute('''
                INSERT INTO Program (
                    programId,
                    title,
                    studyprogCode,
                    studyprogName,
                    studyprogStudyLevel,
                    studyprogStudyLevelCode
                )
                VALUES (
                    :id,
                    :title,
                    :studyprogCode,
                    :studyprogName,
                    :studyprogStudyLevel,
                    :studyprogStudyLevelCode
                )
            ''', program)

    # Commit the changes
    conn.commit()

    # Close the connection
    conn.close()

def initialiseCourses():
    # Connect to the SQLite database (creates a new one if it doesn't exist)
    conn = sqlite3.connect('prisma/db.sqlite')

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    # Clear the Program table
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

def main():
    updateCourses()
    updatePrograms()
    initialisePrograms()
    initialiseCourses()

main()