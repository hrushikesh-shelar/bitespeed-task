// ALL API implementations are in this file:

import { DM } from './models/index.js';

// ##################################
// #### Helper Functions ############
// ##################################

const getExistingContacts = async (phoneNumber, email) => {
  const existingContacts = await DM.getContacts(phoneNumber, email);

  if(existingContacts.length === 0) {
    return [];
  }

  const allPrimaryContactIds = [];
  existingContacts.map((contact) => {
    if(contact.linkprecedence === 'secondary' && !allPrimaryContactIds.includes(contact.linkedid)) {
      allPrimaryContactIds.push(contact.linkedid);
    }
  });

  if(allPrimaryContactIds.length === 0) {
    return existingContacts;
  }

  const primaryContacts = await DM.getContactsByIds(allPrimaryContactIds);
  const allSecondaryContacts = await DM.getAllSecondaryContactsForPrimaryContactInBulk(allPrimaryContactIds);

  const res = [...new Set([...primaryContacts, ...allSecondaryContacts])];
  return res;
};

const checkIfContactExists = (existingContacts, phoneNumber, email) => {
  if(existingContacts.length === 0) {
    return false;
  }

  const matchingContact = existingContacts.find((contact) => contact.email === email && contact.phonenumber === phoneNumber);
  return !(matchingContact === null || matchingContact === undefined);
};

const handlePrimaryContactChange = async (primaryContactsToBeChangedToSecondary, primaryContactId) => {
  if(primaryContactsToBeChangedToSecondary.length === 0) {
    return;
  }

  const primaryContactIdsToBeChangedToSecondary = primaryContactsToBeChangedToSecondary.map((contact) => contact.id);
  await DM.updateLinkedPrimaryId(
		primaryContactIdsToBeChangedToSecondary, primaryContactId
	);
}

const handleUpdateContactsToSecondary = async (newSecondaryContact, primaryContactId) => {
	if (newSecondaryContact.length === 0) {
		return;
	}

  const secondaryContactIdsToBeUpdated = newSecondaryContact
    .filter((contact) => contact.linkedid !== primaryContactId)
    .map((contact) => contact.id);
	await DM.updateContactsToSecondary(secondaryContactIdsToBeUpdated, primaryContactId);
};

const createContact = async (phoneNumber, email, existingContacts) => {
  if(existingContacts.length === 0) {
    await DM.createPrimaryContact(phoneNumber, email);
    return;
  }

	const primaryContacts = existingContacts.filter((contact) => contact.linkprecedence === 'primary');
  const sortedPrimaryContacts = primaryContacts.sort((a, b) => new Date(a.createdat) - new Date(b.createdat));
  const [oldestPrimaryContact, ...newPrimaryContacts] = sortedPrimaryContacts;
  const newSecondaryContact = existingContacts.filter((contact) => contact.id !== oldestPrimaryContact.id);
	
  const primaryContactId = oldestPrimaryContact.id;
  await handlePrimaryContactChange(newPrimaryContacts, primaryContactId);           // Handles changes in secondary contacts whose linkedId is to be turned to primary
  await handleUpdateContactsToSecondary(newSecondaryContact, primaryContactId);  // changes primary contacts to secondary
  await DM.createSecondaryContact(phoneNumber, email, primaryContactId);            // creates secondary contact for given phonenumber & email as per API payload
};

const getUniqueEmailIdsInOrder = (primaryContact, allContacts) => {
  const emailsSet = new Set(primaryContact ? [primaryContact.email] : []);

	const emails = allContacts.reduce(
		(uniqueEmails, contact) => {
			if (!emailsSet.has(contact.email)) {
				emailsSet.add(contact.email);
				uniqueEmails.push(contact.email);
			}
			return uniqueEmails;
		},
		[...emailsSet],
	);

	return emails;
};

const getUniquePhoneNumbersInOrder = (primaryContact, allContacts) => {
	const phoneNumberSet = new Set(primaryContact ? [primaryContact.phonenumber] : []);

	const phoneNumbers = allContacts.reduce(
		(uniquePhoneNumbers, contact) => {
			if (!phoneNumberSet.has(contact.phonenumber)) {
				phoneNumberSet.add(contact.phonenumber);
				uniquePhoneNumbers.push(contact.phonenumber);
			}
			return uniquePhoneNumbers;
		},
		[...phoneNumberSet],
	);

	return phoneNumbers;
};

const constructIdentifyResponse = (allContacts) => {
	const primaryContact = allContacts.find((contact) => contact.linkprecedence === 'primary');

	const emails = getUniqueEmailIdsInOrder(primaryContact, allContacts);
	const phoneNumbers = getUniquePhoneNumbersInOrder(primaryContact, allContacts);
	const secondaryContactIds = allContacts
		.filter((contact) => contact.linkprecedence === 'secondary')
		.map((contact) => contact.id);

	return {
		contact: {
			primaryContactId: primaryContact.id,
			emails,
			phoneNumbers,
			secondaryContactIds,
		},
	};
};

// ##################################
// #### Api orchastrators ###########
// ##################################


const identify = async (req) => {

  const { phoneNumber, email } = req.body;

  // Empty payload case
  if( (phoneNumber === null || phoneNumber === undefined) && (email === null || email === undefined) ){
    return { message: "empty payload. Please pass correct payload to proceed"}
  }

  const existingContacts = await getExistingContacts(phoneNumber, email);
  const doesContactExist = checkIfContactExists(existingContacts, phoneNumber, email);
  if(doesContactExist) {
    const response = constructIdentifyResponse(existingContacts); 
    return response; 
  }

  await createContact(phoneNumber, email, existingContacts);
  const newContacts = await getExistingContacts(phoneNumber, email);
  const response = constructIdentifyResponse(newContacts);

  return response;
}

export const apis = { identify };