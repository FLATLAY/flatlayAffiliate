import { cancelSubscription } from './Stripe';
import { database } from '../../database';

let action;

const getCustomer = (userId) => {
    try {
        // return User findOne by userId SQL
    } catch (exception) {
        action.reject(exception);
    }
};

const handleCancelSubscription = (userId, promise) => {
    try {
        const customer = getCustomer(userId);
        cancelSubscription(customer.subscription.id)
            .then(current_period_end => {
                database.query('UPDATE tbl_user SET status=cancelling, current_period_end=?)', [current_period_end]);
            })
            .catch(error => action.reject(error));
    } catch (exception) {
        action.reject(exception);
    }
};

export default userId =>
    new Promise((resolve, reject) =>
        handleCancelSubscription(userId, { resolve, reject }));
