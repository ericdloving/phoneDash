const {
    client,
    getAllCalls,
    createCall 
} = require('./index')

async function testDB() {
    try {
        const calls = await getAllCalls();
        console.log(calls);
    } catch (error) {
        console.error(error);
    }
}

async function dropTables() {
    try {
        console.log("Starting dropTables()");

        await client.query(`
    DROP TABLE IF EXISTS calls;
    `);
    console.log("finished dropTables()");
    } catch (error) {
        throw error;
    }
}

async function createTables() {
    try {
        console.log(`starting createTables()`);
        await client.query(`
        CREATE TABLE calls (
            callID SERIAL PRIMARY KEY,
            date timestamp NOT NULL,
            direction varchar(15),
            source varchar(255) NOT NULL,
            intermediaries varchar(255),
            destination varchar(255) NOT NULL,
            alertTime interval,
            duration interval,
            accountCode varchar(15)
        );
        `);
        console.log(`finished createTables()`);
    } catch (error) {
        throw error;
    }
}

async function createInitialCalls() {
    try {
        console.log("Starting to create calls...");
        const seedCall = await createCall('03/13/2024 12:26:44 am,inbound,4053613825,,4055953100,0:00,2:12,')
        console.log("cic", seedCall)
        console.log("finished createInitialCalls()")

    } catch (error) {
        console.error("Error creating initial calls")
        throw error
    }
}

async function rebuildDB() {
    try {
        client.connect();

        await dropTables();
        await createTables();
        await createInitialCalls();
    } catch (error) {
        console.error(error);
    }
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());