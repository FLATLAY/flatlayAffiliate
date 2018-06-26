const getDescription = (description, metadata) => {
	try {
		const hasDescription = metadata && metadata.description ? metadata.description : description;
		return hasDescription || 'No description';
	} catch (exception) {
		throw (exception)
	}
};

const parseLines = (lines) => {
	try {
		return lines.map(({ amount, description, metadata, period }) => {
			return {
				amount,
				description: getDescription(description, metadata),
				period: {
					start: period.start,
					end: period.end,
				},
			};
		});
	} catch (exception) {
		throw (exception);
	}
};

const buildInvoiceFromCharge = (
	{ _id },
	{ created, paid, amount, description, invoice, period }
) => {
	try {
		return !invoice ? {
			userId: _id,
			date: created,
			paid,
			amount_due: amount,
			subtotal: amount,
			total: amount,
			lines: [{ amount, description, period }],
		} : null;
	} catch (exception) {
		throw (exception);
	}
};

const buildInvoice = (
	{ _id },
	{ date, paid, amount_due, subtotal, total, lines }
) => {
	try {
		return {
			productService: 'membership',
			userId: _id,
			date,
			paid,
			amount_due,
			subtotal,
			total,
			lines: parseLines(lines.data),
		};
	} catch (exception) {
		throw (exception);
	}
};

const invoicePaymentSucceeded = webhook => {
	try {
		let invoice;

		const invoiceType = webhook.data.object.object; // equals 'invoice' or 'charge'
		const invoiceData = webhook.data.object;
		const customerId = invoiceData.customer;
		const customer = null /* user findOne by customerId SQL */;

		if (customer) {
			if (invoiceType === 'invoice') invoice = buildInvoice(user, invoiceData);
			if (invoiceType === 'charge') invoice = buildInvoiceFromCharge(user, invoiceData);
			// insert invoice into Invoice table SQL
		} else {
			throw (`Customer ${invoiceData.customer} not found.`);
		}
	} catch (exception) {
		throw (`[invoicePaymentSucceeded] ${exception}`);
	}
};

export default invoicePaymentSucceeded;
