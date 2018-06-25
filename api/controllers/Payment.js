import { updateCustomer } from './Stripe';
import { database } from '../../database';

let action;

const getCustomer = async (userId) => {
    try {
        return await database.query('<query>', ['args']);
    } catch (exception) {
        action.reject(exception);
    }
};

const handleUpdatePayment = async ({ userId, source }, promise) => {
    try {
        action = promise;
        const customer = await getCustomer(userId);
        if (customer) {
            updateCustomer(customer.customerId, { source })
                .then(sources => {
                    const card = sources.data[0];
                    database.query('UPDATE tbl_user SET brand=?, last4=?)', [card.brand, card.last4]);
                })
                .catch((exception) => {
                    action.reject(exception);
                });
        }
    } catch (exception) {
        action.reject(exception);
    }
};

export default userId =>
    new Promise((resolve, reject) =>
        handleUpdatePayment(userId, { resolve, reject }));
