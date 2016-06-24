const Dimension = require('./dimension');
const coreDimensions = require('./core-dimensions');

exports.Dimension = Dimension;
exports.coreDimensions = coreDimensions;
exports.Polytype = require('./polytype');

require('./register-error-code');
