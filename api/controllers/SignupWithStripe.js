import { createCustomer, createSubscription } from './Stripe';

let action;

const createCustomerInDatabase = customer => {
    try {
        // insert single customer into User table SQL
    } catch (exception) {
        action.reject(exception);
    }
};

const createSubscriptionOnStripe = ({ customer, plan }) => {
    try {
        return createSubscription({ customer, plan })
            .then(subscription => subscription)
            .catch(error => error);
    } catch (exception) {
        action.reject(exception);
    }
};

const createCustomerOnStripe = ({ userId, profile, email }, source) => {
    try {
        return createCustomer({ email, source, metadata: profile.name })
            .then(({ id, sources }) => {
                const card = sources.data[0];
                return { card, id };
            })
            .catch(error => action.reject(error));
    } catch (exception) {
        action.reject(exception);
    }
};

const createUser = ({ email, password, profile }) => {
    try {
        /**
         * Create a single "customer" in database
         * {
         *   email: <email>
         *   password: <password>
         *   profile: <profile>
         * }
         */
    } catch (exception) {
        action.reject(exception);
    }
};

const handleSignup = (options, promise) => {
    try {
        action = promise;
        const userId = createUser(options.user);

        createCustomerOnStripe({ ...options.user, userId }, options.source)
            .then(customer => {
                createSubscriptionOnStripe({ userId, customer: customer.id, plan: options.user.plan })
                    .then(({ id, status, items, current_period_end }) => {
                        createCustomerInDatabase({
                            userId,
                            customerId: customer.id,
                            card: { brand: customer.card.brand, last4: customer.card.last4 },
                            subscription: { id, status, plan: items.data[0].plan.id, current_period_end },
                        });
                        action.resolve();
                    });
            })
            .catch(error => promise.reject(`[handleSignup] ${error}`));
    } catch (exception) {
        action.reject(exception);
    }
};

export default customer =>
    new Promise((resolve, reject) =>
        handleSignup(customer, { resolve, reject }));