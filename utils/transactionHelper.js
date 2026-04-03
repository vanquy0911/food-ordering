const mongoose = require('mongoose');

/**
 * Executes a callback within a MongoDB transaction.
 * Automatically handles session creation, transaction start, commit, and abort on error.
 * 
 * @param {Function} work - An async function that contains the DB operations. 
 *                          Receives 'session' as an argument.
 * @returns {Promise<any>} - The result of the work function.
 * @throws {Error} - Re-throws any error occurred during transaction.
 */
const runInTransaction = async (work) => {
    const session = await mongoose.startSession();
    
    try {
        session.startTransaction();

        // Execute the work function with the current session
        const result = await work(session);

        // If success, commit the transaction
        await session.commitTransaction();
        return result;

    } catch (error) {
        // If an error occurs, abort the transaction
        await session.abortTransaction();
        console.error("Transaction Aborted Due to Error:", error.message);
        throw error;

    } finally {
        // Always end the session
        session.endSession();
    }
};

module.exports = { runInTransaction };
