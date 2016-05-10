const Polytoken = require('./polytoken');
const Dimension = require('./dimension');
const coreDimensions = require('./core-dimensions');

exports.Polytoken = Polytoken;
exports.Dimension = Dimension;
exports.coreDimensions = CoreDimensions;

// TODO: Validate all this stuff
const defaultPolytoken = new Polytoken();
for (let dimensionName in coreDimensions) {
	defaultPolytoken.registerDimension(coreDimensions[dimensionName]);
}
exports.registerDimension = defaultPolytoken.registerDimension.bind(defaultPolytoken);
exports.createPolytype = defaultPolytoken.createPolytype.bind(defaultPolytoken);
