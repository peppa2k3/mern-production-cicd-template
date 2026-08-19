const AppError = require('../errors/AppError');

// Generic Joi validation middleware factory.
// Usage: validate(schema, 'body' | 'query' | 'params')
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((d) => d.message);
      return next(AppError.badRequest('Validation failed', details));
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
