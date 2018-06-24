const customerSubscriptionUpdated = ({ data }) => {
	try {
		/**
		 * Update user SQL:
		 *
		 * subscription {
		 *   id: <data.id>
		 *   plan: <data.plan.id>
		 *   current_period_end: <data.current_period_end>
		 *   status: <data.cancel_at_period_end ? 'cancelling' : data.status>
		 * }
		 *
		 */
	} catch (exception) {
		throw (exception);
	}
};

export default customerSubscriptionUpdated;
