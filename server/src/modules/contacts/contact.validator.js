const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  subject: Joi.string().allow('', null),
  message: Joi.string().min(5).required(),
});

const update = Joi.object({
  status: Joi.string().valid('new', 'in_progress', 'resolved', 'closed'),
  note: Joi.string().allow('', null),
  assignee: Joi.string().allow('', null),
});

module.exports = { create, update };
