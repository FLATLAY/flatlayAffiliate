import { createSubscription, changeSubscription } from './Stripe';
import { database } from '../../database';

let action;

const getCustomer = async (userId) => {
    console.log(userId);
    try {
        // return User findOne by userId SQL
        return await database.query('SELECT * FROM tbl_user where userid=?', [userId])
    } catch (exception) {
        action.reject(exception);
    }
};

const updateCustomer = async (customerId, { id, status, plan, current_period_end }) => {
    console.log(customerId, { id, status, plan, current_period_end });
    try {
        return await database.query('UPDATE tbl_user SET subscriptionid=?, status=?, plan=?, current_period_end=?)',
            [id, status, plan, current_period_end]);
    } catch (exception) {
        action.reject(exception);
    }
};

const handleChangeSubscription = async ({ userId, newPlan }, promise) => {
    console.log({ userId, newPlan });
    try {
        action = promise;
        const customer = await getCustomer(userId);
        const status = customer.subscription.status;
        const hasSubscription = status === 'active' || status === 'trialing' || status === 'cancelling';

        if (hasSubscription) {
            changeSubscription(customer.subscription.id, { plan: newPlan })
                .then(change => {
                    updateCustomer(customer._id, change);
                    action.resolve();
                })
                .catch(error => action.reject(error));
        } else {
            createSubscription({ customer: customer.customerId, plan: newPlan })
                .then(change => {
                    updateCustomer(customer._id, { ...change });
                })
                .catch(error => action.reject(error));
        }
    } catch (exception) {
        action.reject(exception);
    }
};

export default userId =>
    new Promise((resolve, reject) =>
        handleChangeSubscription(userId, { resolve, reject }));

