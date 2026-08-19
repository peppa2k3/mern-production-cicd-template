const Joi = require('joi');

const mediaItem = Joi.object({
  url: Joi.string().required(),
  isPrimary: Joi.boolean().default(false),
  order: Joi.number().default(0),
});

const create = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow('', null),
  shortDescription: Joi.string().max(300).allow('', null),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0).allow(null),
  images: Joi.array().items(mediaItem).default([]),
  videos: Joi.array().items(mediaItem).default([]),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).default([]),
  affiliateLink: Joi.string().uri().required(),
  commissionType: Joi.string().valid('percent', 'fixed').default('percent'),
  commissionValue: Joi.number().min(0).required(),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  isFeatured: Joi.boolean().default(false),
  isHot: Joi.boolean().default(false),
});

const update = create.fork(
  ['name', 'price', 'category', 'affiliateLink', 'commissionValue'],
  (s) => s.optional()
);

const query = Joi.object({
  page: Joi.number(),
  limit: Joi.number(),
  sort: Joi.string(),
  category: Joi.string(),
  search: Joi.string().allow(''),
  status: Joi.string(),
  isFeatured: Joi.string(),
  isHot: Joi.string(),
  minPrice: Joi.number(),
  maxPrice: Joi.number(),
});

module.exports = { create, update, query };
