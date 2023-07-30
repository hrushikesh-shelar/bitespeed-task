--  This file is for just showing db commands used while creating table

CREATE DATABASE bitespeed;

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  phoneNumber VARCHAR,
  email VARCHAR,
  linkedId INTEGER,
  linkPrecedence VARCHAR(10) CHECK (linkPrecedence IN ('primary', 'secondary')),
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
  deletedAt TIMESTAMP
);