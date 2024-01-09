import json
import pg8000
import requests

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
    # Connect to the PostgreSQL database
    conn = pg8000.connect(
        user="default",
        password="EWBNT2vS5hcy",
        host="ep-bitter-rain-79474510.us-east-1.postgres.vercel-storage.com",
        port=5432,
        database="verceldb",
        ssl_context="require"
    )

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    # Drop the "program" table if it exists
    cursor.execute('DROP TABLE IF EXISTS "program"')

    # Create the "program" table
    cursor.execute('''
        CREATE TABLE "program" (
            "programid" VARCHAR(255) PRIMARY KEY,
            "title" VARCHAR(255),
            "studyprogcode" VARCHAR(255),
            "studyprogname" VARCHAR(255),
            "studyprogstudylevel" VARCHAR(255),
            "studyprogstudylevelcode" VARCHAR(255)
        )
    ''')

    # Open the JSON file for reading
    with open('prisma/db/programs.json', 'r') as json_file:
        # Load the JSON data from the file
        programs = json.load(json_file)

    for language in programs:
        for program in programs[language]["docs"]:
            # Insert the data into the "program" table
            cursor.execute('''
                INSERT INTO "program" (
                    "programid",
                    "title",
                    "studyprogcode",
                    "studyprogname",
                    "studyprogstudylevel",
                    "studyprogstudylevelcode"
                )
                VALUES (
                    %(id)s,
                    %(title)s,
                    %(studyprogCode)s,
                    %(studyprogName)s,
                    %(studyprogStudyLevel)s,
                    %(studyprogStudyLevelCode)s
                )
            ''', program)

    # Commit the changes
    conn.commit()

    # Close the connection
    conn.close()

def initialiseCourses():
    # Connect to the PostgreSQL database
    conn = pg8000.connect(
        user="default",
        password="EWBNT2vS5hcy",
        host="ep-bitter-rain-79474510.us-east-1.postgres.vercel-storage.com",
        port=5432,
        database="verceldb",
        ssl_context="require"
    )

    # Create a cursor object to execute SQL queries
    cursor = conn.cursor()

    # Drop the "course" table if it exists
    cursor.execute('DROP TABLE IF EXISTS "course"')

    # Create the "course" table
    cursor.execute('''
        CREATE TABLE "course" (
            "courseid" VARCHAR(255) PRIMARY KEY,
            "name" VARCHAR(255),
            "ownerid" INT,
            "showtype" BOOLEAN,
            "detailtype" VARCHAR(255),
            "name_en" VARCHAR(255),
            "name_nn" VARCHAR(255),
            "coursetype" VARCHAR(255),
            "tpsort" VARCHAR(255),
            "showdiscipline" BOOLEAN,
            "campusid" VARCHAR(255),
            "yearfrom_und" INT,
            "seasonfrom_und" VARCHAR(255),
            "yearto_und" VARCHAR(255),
            "seasonto_und" VARCHAR(255),
            "yearfrom_ex" INT,
            "seasonfrom_ex" VARCHAR(255),
            "yearto_ex" VARCHAR(255),
            "seasonto_ex" VARCHAR(255),
            "departmentid_secondary" INT,
            "create_activity_zoom" BOOLEAN,
            "authorized_netgroups" VARCHAR(255),
            "tpn_copy_daytime" BOOLEAN,
            "nofterms" INT,
            "terminnr" INT,
            "fullname" VARCHAR(255),
            "fullname_en" VARCHAR(255),
            "fullname_nn" VARCHAR(255),
            "idtermin" VARCHAR(255)
        )
    ''')

    # Open the JSON file for reading
    with open('prisma/db/courses.json', 'r') as json_file:
        # Load the JSON data from the file
        courses = json.load(json_file)

    for course in courses:
        # Check if the course already exists
        cursor.execute("SELECT COUNT(*) FROM \"course\" WHERE \"courseid\" = %(id)s", {"id": course["id"]})
        existing_count = cursor.fetchone()[0]

        if existing_count == 0:
            # Insert the data into the "course" table
            cursor.execute('''
                INSERT INTO "course" (
                    "courseid",
                    "name",
                    "ownerid",
                    "showtype",
                    "detailtype",
                    "name_en",
                    "name_nn",
                    "coursetype",
                    "tpsort",
                    "showdiscipline",
                    "campusid",
                    "yearfrom_und",
                    "seasonfrom_und",
                    "yearto_und",
                    "seasonto_und",
                    "yearfrom_ex",
                    "seasonfrom_ex",
                    "yearto_ex",
                    "seasonto_ex",
                    "departmentid_secondary",
                    "create_activity_zoom",
                    "authorized_netgroups",
                    "tpn_copy_daytime",
                    "nofterms",
                    "terminnr",
                    "fullname",
                    "fullname_en",
                    "fullname_nn",
                    "idtermin"
                )
                VALUES (
                    %(id)s,
                    %(name)s,
                    %(ownerid)s,
                    %(showtype)s,
                    %(detailtype)s,
                    %(name_en)s,
                    %(name_nn)s,
                    %(coursetype)s,
                    %(tpsort)s,
                    %(showdiscipline)s,
                    %(campusid)s,
                    %(yearfrom_und)s,
                    %(seasonfrom_und)s,
                    %(yearto_und)s,
                    %(seasonto_und)s,
                    %(yearfrom_ex)s,
                    %(seasonfrom_ex)s,
                    %(yearto_ex)s,
                    %(seasonto_ex)s,
                    %(departmentid_secondary)s,
                    %(create_activity_zoom)s,
                    %(authorized_netgroups)s,
                    %(tpn_copy_daytime)s,
                    %(nofterms)s,
                    %(terminnr)s,
                    %(fullname)s,
                    %(fullname_en)s,
                    %(fullname_nn)s,
                    %(idtermin)s
                )
            ''', course)

    # Commit the changes for the "course" table
    conn.commit()

    # Close the connection
    conn.close()

def main():
    updateCourses()
    updatePrograms()
    initialisePrograms()
    initialiseCourses()

if __name__ == "__main__":
    main()
