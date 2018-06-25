import { createSubscription, changeSubscription } from './Stripe';

let action;

const getCustomer = (userId) => {
    try {
        // return User findOne by userId SQL
        connection.query('SELECT * FROM tbl_user where userid=?',
        [userId],
        function(err, result){
            if(!err){

            } else {

            }
        });
    } catch (exception) {
        action.reject(exception);
    }
};

const updateCustomer = (customerId, { id, status, plan, current_period_end }) => {
    try {
        /**
         * Update user SQL:
         *
         * subscription {
         *   id: <id>
         *   status: <current_period_end>
         *   plan: <plan.id>
         *   current_period_end: <current_period_end>
         * }
         *
         */
        connection.query('UPDATE tbl_user SET subscriptionid=?, status=?, plan=?, current_period_end=?)',
        [id, status, plan, current_period_end],
        function(err, result){
            if(!err){

            } else {

            }
        });
    } catch (exception) {
        action.reject(exception);
    }
};

const handleChangeSubscription = ({ userId, newPlan }, promise) => {
    try {
        action = promise;
        const customer = getCustomer(userId);
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

