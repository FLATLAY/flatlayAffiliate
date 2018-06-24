import stripe from 'stripe';

import customerSubscriptionDeleted from '../../webhooks/customer.subscription.deleted';
import customerSubscriptionUpdated from '../../webhooks/customer.subscription.updated';
import invoicePaymentSucceeded from '../../webhooks/invoice.payment_succeeded';

export const webhooks = {
  'customer.subscription.deleted': customerSubscriptionDeleted,
  'customer.subscription.updated': customerSubscriptionUpdated,
  'invoice.payment_succeeded': invoicePaymentSucceeded,
};

const API_SECRET_KEY = '';
const action = stripe(API_SECRET_KEY);

/*
  customer = {
    description: String,
    source: String, // A Stripe token from the client.
  };
*/
export const createCustomer = customer =>
  action.customers.create(customer);

/*
  customerId: String,
  update: Object, // Contains properties to update on Stripe. For example: { source: <token> }
*/
export const updateCustomer = (customerId, update) =>
  action.customers.update(customerId, update);

/*
  subscription = {
    customer: String, // ID of the customer on Stripe. For example: cus_AGLTqnNknWBxKF.
    plan: String, // The ID of the plan to subscribe the customer to. For example: large.createCustomerInDatabase
  };
*/
export const createSubscription = subscription =>
  action.subscriptions.create(subscription);

/*
  subscriptionId = String; // The ID of the subscription on Stripe. For example: sub_AGLTRCbGMwmQcQ.
*/
export const cancelSubscription = subscriptionId =>
  action.subscriptions.del(subscriptionId, { at_period_end: true });

/*
  subscriptionId = String; // The ID of the subscription on Stripe. For example: sub_AGLTRCbGMwmQcQ.
  update = Object; // Contains properties to update on Stripe. For example: { plan: "large" }
*/
export const changeSubscription = (subscriptionId, update) =>
  action.subscriptions.update(subscriptionId, update);
