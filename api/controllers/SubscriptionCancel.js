import { cancelSubscription } from './Stripe';

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

                /**
                 * Update user SQL:
                 *
                 * subscription {
                 *   status: 'cancelling'
                 *   current_period_end: <current_period_end>
                 * }
                 *
                 */
                connection.query('UPDATE tbl_user SET status=cancelling, current_period_end=?)',
                [current_period_end],
                function(, result){
                    if(!err){

                    } else {

                    }
                });
            })
            .catch(error => action.reject(error));
    } catch (exception) {
        action.reject(exception);
    }
};

export default userId =>
    new Promise((resolve, reject) =>
        handleCancelSubscription(userId, { resolve, reject }));
