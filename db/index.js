const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/phone-dev');

async function getAllCalls() {
    const { rows } = await client.query(
        `SELECT callID, date, destination
        FROM calls;
        `);
        
    return rows;
}

async function createCall(details) {
    try {
        console.log("createCall received", details);
       //if (!details.timestamp || !details.source || !details.destination) return -1;

        // Parse and format the date string
        const date = new Date(details.timestamp);
        const formattedDate = date.toISOString()
        const queryString = `INSERT INTO calls (date, source, `
        if (details.direction) queryString += 'direction, '
        if (details.intermediaries) queryString += 'intermediaries, '
        queryString += 'destination, alertTime, duration'
        details.accountCode ? queryString += ', accountCode)' : queryString += ')'
        queryString += ` VALUES (TIMESTAMP ${formattedDate}, ${details.source}, `
        if (details.direction) queryString += `${details.direction}, `
        if (details.intermediaries) queryString += `${details.intermediaries}, `
        queryString += `${details.destination}, ${details.alertTime}, ${details.duration}`
        details.accountCode ? queryString += `, ${details.accountCode})` : ')' 
console.log(`XXXX the query string is ${queryString}`)
        const result = await client.query(queryString);

        console.log("the result of createCall is " + result);

    } catch (error) {
        throw error;
    }
}


module.exports = {
    client,
    getAllCalls,
    createCall,
}
