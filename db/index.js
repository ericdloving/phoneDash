const { Client } = require('pg');
const client = new Client('postgres://localhost:5432/phone-dev');

async function getAllCalls() {
    const { rows } = await client.query(
        `SELECT *
        FROM calls;
        `);
        
    return rows;
}

function parseCSVString(csvString) {
    const attributes = ["date", "direction", "source", "intermediateDestinations", "destination", "alertTime", "duration", "accountCode"];
    const values = csvString.split(',');
    const result = {};

    let intermediateDestinations = '';
    let isInIntermediateDestinations = false;

    attributes.forEach((attribute, index) => {
        let value = values[index] || ''; // handle missing values
        if (value.startsWith('"') && !value.endsWith('"')) {
            isInIntermediateDestinations = true;
            intermediateDestinations += value;
        } else if (isInIntermediateDestinations) {
            intermediateDestinations += ',' + value;
            if (value.endsWith('"')) {
                result[attribute] = intermediateDestinations;
                isInIntermediateDestinations = false;
                intermediateDestinations = '';
            }
        } else {
            result[attribute] = value;
        }
    });

    return result;
}



async function createCall(csvString) {
    try {
        details = parseCSVString(csvString)

        //this prevents seconds from going into the db as minutes.
        if(details.alertTime.length < 6) details.alertTime = '0:'+details.alertTime
        if(details.duration.length < 6) details.duration = '0:' + details.duration
 
        //saddleback's timestamp is not psql compliant--translate it.
        const formattedDate = convertToPostgresTimestamp(details.date)

        //optional todo -- convert this to $1 $2 notation to reduce sql injection risk
        let queryString = `INSERT INTO calls (date, source, `
        if (details.direction) queryString += 'direction, '
        if (details.intermediaries) queryString += 'intermediaries, '
        queryString += 'destination, alertTime, duration'
        details.accountCode ? queryString += ', accountcode)' : queryString += ')'
        queryString += ` VALUES (TIMESTAMP '${formattedDate}', '${details.source}', `
        if (details.direction) queryString += `'${details.direction}', `
        if (details.intermediaries) queryString += `'${details.intermediaries}', `
        queryString += `'${details.destination}', INTERVAL '${details.alertTime}', INTERVAL '${details.duration}'`
        details.accountCode ? queryString += `, '${details.accountCode}')` : queryString += ')' 
        const result = await client.query(queryString);
        
    } catch (error) {
        throw error;
    }
}
function convertToPostgresTimestamp(timeStr) {
    // Check if the input string is empty or null
    if (!timeStr) {
        return null;
    }

    // Split the input string into date and time parts
    const [datePart, ...timeParts] = timeStr.split(' ');

    // Check if datePart or timeParts are missing
    if (!datePart || timeParts.length === 0) {
        return null;
    }

    // Split the date part into day, month, and year
    const [month, day, year] = datePart.split('/');

    // Check if month, day, or year is missing or invalid
    if (!month || !day || !year || isNaN(month) || isNaN(day) || isNaN(year)) {
        return null;
    }

    // Join the remaining time parts to reconstruct the time
    const time = timeParts.join(' ');

    // Split the time into hour, minute, and second
    const [hour, minute, second, ampm] = time.split(/:| /);

    // Check if hour, minute, or second is missing or invalid
    if (!hour || !minute || !second || isNaN(hour) || isNaN(minute) || isNaN(second)) {
        return null;
    }

    // Convert 12-hour format to 24-hour format
    let hour24 = parseInt(hour, 10);
    if (ampm && ampm.toLowerCase() === 'pm' && hour24 < 12) {
        hour24 += 12;
    } else if (ampm && ampm.toLowerCase() === 'am' && hour24 === 12) {
        hour24 = 0;
    }

    // Format the date and time for PostgreSQL timestamp
    const formattedDateTime = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} ${hour24.toString().padStart(2, '0')}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}`;

    return formattedDateTime;
}


module.exports = {
    client,
    getAllCalls,
    createCall,
}
