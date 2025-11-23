const Airtable = require('airtable');

const BASE_ID = 'appqdIjIRquGZOwP0';
const TABLE_ID = 'tbl0ftTRWwv63mgaH';

function getBase(context) {
    return new Airtable({ apiKey: context.AIRTABLE_TOKEN }).base(BASE_ID);
}

async function getRecords(context) {
    const base = getBase(context);
    const records = await base(TABLE_ID).select({
        view: 'Grid view'
    }).firstPage();
    return records;
}

async function addParticipant(context, phoneNumber) {
    const base = getBase(context);
    const record = await base('Participants').create({ 'Phone Number': phoneNumber });
    return record;
}

async function updateName(context, recordId, name) {
    const base = getBase(context);
    const record = await base('Participants').update(recordId, { 'Name': name, 'Enrolled': true });
    return record;
}

module.exports = {
    getRecords,
    addParticipant,
    updateName
};