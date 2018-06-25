import { updateCustomer } from './Stripe';

let action;

const getCustomer = (userId) => {
    try {
        // return user findOne by userId SQL
        connection.query('SELECT * FROM tbl_user WHERE id=?)',
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

const handleUpdatePayment = ({ userId, source }, promise) => {
    try {
        action = promise;
        const customer = getCustomer(userId);
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
