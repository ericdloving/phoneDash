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
        console.log("createCall received", details)
        if(!details.timestamp || !details.source || !details.destination) return -1
        const result = await client.query(`
        INSERT INTO calls (date, source, direction,intermediaries, destination, alertTime, duration, accountCode) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
        `,[
        details.timestamp,
        details.source,
        details.direction || null,
        details.intermediaries || null,
        details.alertTime || null,
        details.duration || null,
        details.accountCode || null
        ])
        console.log("the result of createCall is " + result)

    } catch (error) {
        throw error;
    }
}

module.exports = {
    client,
    getAllCalls,
    createCall,
}
