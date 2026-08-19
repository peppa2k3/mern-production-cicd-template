const Joi = require('joi');

const create = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phone: Joi.string().allow('', null),
  role: Joi.string().required(), // role id
  isActive: Joi.boolean().default(true),
});

const update = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow('', null),
  role: Joi.string(),
  isActive: Joi.boolean(),
  avatar: Joi.string().allow('', null),
});

const updateProfile = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().allow('', null),
  avatar: Joi.string().allow('', null),
});

module.exports = { create, update, updateProfile };
