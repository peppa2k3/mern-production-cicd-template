const Joi = require('joi');

const create = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  message: Joi.string().min(2).required(),
  targetType: Joi.string().valid('all', 'role', 'user').required(),
  targetRole: Joi.string().when('targetType', { is: 'role', then: Joi.required() }),
  recipients: Joi.array()
    .items(Joi.string())
    .when('targetType', { is: 'user', then: Joi.array().min(1).required() }),
});

module.exports = { create };
