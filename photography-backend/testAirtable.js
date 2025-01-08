require("dotenv").config();
const Airtable = require("airtable");

const base = new Airtable({
    apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
}).base(process.env.AIRTABLE_BASE_ID);

base(process.env.PHOTOS_TABLE)
    .select({ maxRecords: 5, view: "Grid view" })
    .eachPage((records, fetchNextPage) => {
        records.forEach((record) => {
            console.log(record.fields);
        });
        fetchNextPage();
    }, (err) => {
        if (err) console.error(err);
    });