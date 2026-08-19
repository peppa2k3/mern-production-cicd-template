const Joi = require('joi');

const create = Joi.object({
  user: Joi.string().required(),
  displayName: Joi.string().min(2).max(150).required(),
  route: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .required(),
  avatar: Joi.string().allow('', null),
  banner: Joi.string().allow('', null),
  bio: Joi.string().allow('', null),
  socials: Joi.object({
    facebook: Joi.string().allow('', null),
    instagram: Joi.string().allow('', null),
    tiktok: Joi.string().allow('', null),
    youtube: Joi.string().allow('', null),
    website: Joi.string().allow('', null),
  }).default({}),
  isActive: Joi.boolean().default(true),
});

const update = create.fork(['user', 'route'], (s) => s.optional());

const addProduct = Joi.object({
  productId: Joi.string().required(),
});

const reorder = Joi.object({
  productIds: Joi.array().items(Joi.string()).required(),
});

const pin = Joi.object({
  isPinned: Joi.boolean().required(),
});

module.exports = { create, update, addProduct, reorder, pin };
