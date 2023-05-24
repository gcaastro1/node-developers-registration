CREATE DATABASE sp3_developers;
CREATE TYPE os AS ENUM ('Windows', 'Linux', 'MacOS');
CREATE TABLE IF NOT EXISTS developer_infos (
  "id" SERIAL PRIMARY KEY,
  "developerSince" DATE NOT NULL,
  "preferredOS" os NOT NULL
);
CREATE TABLE IF NOT EXISTS developers (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL,
  "email" VARCHAR(50) UNIQUE NOT NULL,
  "developerInfosId" INTEGER UNIQUE,
  FOREIGN KEY ("developerInfosId") REFERENCES developer_infos("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS projects (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(50) NOT NULL,
  "description" TEXT NOT NULL,
  "estimatedTime" VARCHAR(20) NOT NULL,
  "repository" VARCHAR(120) NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE,
  "developerId" INTEGER,
  FOREIGN KEY ("developerId") REFERENCES developers("id") ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS technologies (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(30) NOT NULL
);
INSERT INTO technologies (name)
VALUES ('JavaScript'),
  ('Python'),
  ('React'),
  ('Express.js'),
  ('HTML'),
  ('CSS'),
  ('Django'),
  ('PostgreSQL'),
  ('MongoDB');
CREATE TABLE IF NOT EXISTS projects_technologies (
  "id" SERIAL PRIMARY KEY,
  "addedIn" DATE NOT NULL,
  "projectId" INTEGER,
  "technologyId" INTEGER,
  FOREIGN KEY ("projectId") REFERENCES projects("id"),
  FOREIGN KEY ("technologyId") REFERENCES technologies("id")
);