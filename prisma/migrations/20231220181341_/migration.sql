/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `disp_name` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `study_level` on the `Course` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Post_name_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Program" (
    "programId" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "studyprogCode" TEXT NOT NULL,
    "studyprogName" TEXT NOT NULL,
    "studyprogStudyLevel" TEXT NOT NULL,
    "studyprogStudyLevelCode" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "StudyPlan" (
    "studyPlanId" TEXT NOT NULL PRIMARY KEY,
    "json_data" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "courseId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerid" INTEGER,
    "showtype" INTEGER,
    "detailtype" TEXT,
    "name_en" TEXT,
    "name_nn" TEXT,
    "coursetype" TEXT,
    "tpsort" TEXT,
    "showdiscipline" INTEGER,
    "campusid" TEXT,
    "yearfrom_und" INTEGER,
    "seasonfrom_und" TEXT,
    "yearto_und" TEXT,
    "seasonto_und" TEXT,
    "yearfrom_ex" INTEGER,
    "seasonfrom_ex" TEXT,
    "yearto_ex" TEXT,
    "seasonto_ex" TEXT,
    "departmentid_secondary" INTEGER,
    "create_activity_zoom" INTEGER,
    "authorized_netgroups" TEXT,
    "tpn_copy_daytime" TEXT,
    "nofterms" INTEGER,
    "terminnr" INTEGER,
    "fullname" TEXT,
    "fullname_en" TEXT,
    "fullname_nn" TEXT,
    "idtermin" TEXT
);
INSERT INTO "new_Course" ("name") SELECT "name" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE INDEX "Course_courseId_idx" ON "Course"("courseId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Program_programId_idx" ON "Program"("programId");

-- CreateIndex
CREATE INDEX "StudyPlan_studyPlanId_idx" ON "StudyPlan"("studyPlanId");
