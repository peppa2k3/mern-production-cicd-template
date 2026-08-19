const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  displayName: Joi.string().min(2).max(100).required(),
  description: Joi.string().allow('', null),
  permissions: Joi.array().items(Joi.string()).default([]),
});

const update = Joi.object({
  displayName: Joi.string().min(2).max(100),
  description: Joi.string().allow('', null),
  permissions: Joi.array().items(Joi.string()),
});

module.exports = { create, update };
