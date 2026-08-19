const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
  parent: Joi.string().allow('', null),
  isActive: Joi.boolean().default(true),
  order: Joi.number().default(0),
});

const update = Joi.object({
  name: Joi.string().min(2).max(150),
  description: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
  parent: Joi.string().allow('', null),
  isActive: Joi.boolean(),
  order: Joi.number(),
});

module.exports = { create, update };
