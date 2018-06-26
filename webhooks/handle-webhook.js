import { webhooks as stripe } from '../api/controllers/Stripe';

export default {
	stripe(type, data) {
		const handler = stripe[type];
		if (handler) return handler(data);
		return `${type} is not supported.`;
	},
};
