// db query layer

import { pool } from './db.js';

const getContacts = async (phoneNumber, email) => {
   const { rows: contacts } = await pool.query(
			'SELECT * FROM contacts WHERE phoneNumber = $1 OR email = $2',
			[phoneNumber, email],
		);
    return contacts;
}

const getContactsByIds = async (ids) => {
  const { rows: contacts } = await pool.query(
    'SELECT * FROM contacts WHERE id = ANY($1)', [
		ids,
	]);
	return contacts;
};

const getAllSecondaryContactsForPrimaryContactInBulk = async (primaryIds) => {
  const { rows: contacts } = await pool.query(
    'SELECT * FROM contacts WHERE linkedid = ANY($1)', [
		primaryIds,
	]);
	return contacts;
}

const createPrimaryContact = async (phoneNumber, email) => {
  await pool.query(
		'INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence) VALUES ($1, $2, null, $3)',
		[phoneNumber, email, 'primary'],
	);
}

const createSecondaryContact = async (phoneNumber, email, primaryContactId) => {
	await pool.query(
		'INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence) VALUES ($1, $2, $3, $4)',
		[phoneNumber, email, primaryContactId, 'secondary'],
	);
};

const updateContactsToSecondary = async(ids, primaryContactId) => {
  await pool.query(
    'UPDATE contacts SET linkedId = $1, linkPrecedence = $2, updatedat = NOW() WHERE id = ANY($3)', [
      primaryContactId, 'secondary', ids
    ]
  )
};

const updateLinkedPrimaryId = async (existingLinkedIds, primaryContactId) => {
  await pool.query(
		'UPDATE contacts SET linkedId = $1, updatedat = NOW() WHERE linkedid = ANY($2)', [
      primaryContactId, existingLinkedIds
    ]
	);
}

export const DM = {
	getContacts,
	getContactsByIds,
	getAllSecondaryContactsForPrimaryContactInBulk,
	createPrimaryContact,
	createSecondaryContact,
	updateContactsToSecondary,
	updateLinkedPrimaryId,
};