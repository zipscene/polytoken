const Polytype = require('./polytype');
const XError = require('xerror');

/**
 * The main class for the Polytoken library; for most applications, only one will need to be constructed.
 * Dimensions are registered onto this class, after which makePolytype() will generate a class for a specific type
 * that does the actual token work.
 *
 * @class Polytoken
 * @constructor
 */
class Polytoken {

	constructor() {
		this.dimensionClasses = {};
	}

	/**
	 * Register a dimension type to be used by this Polytoken.
	 *
	 * @method registerDimension
	 * @param {String} name - The name of the dimension.
	 * @param {Function} Dimension - The dimension class to be registered.
	 */
	registerDimension(name, Dimension) {
		this.dimensionClasses[name] = Dimension;
	}

	/**
	 * Given a dimensions spec, create a Polytype class to do token operations on that specified type. The
	 * dimensions should be passed in the form:
	 * [ { name: 'Number', tokenConfig: { ... } }, { ... } ]
	 *
	 * @method createPolytype
	 * @param {Array[Mixed]} dimensionSpec
	 * @return Polytype
	 */
	createPolytype(dimensionSpec) {
		// TODO: Verify that this works, fix it if it doesn't :p
		let dimensions = [];
		for (let dimensionConfig of dimensionSpec) {
			let Dimension = this.dimensionClasses[dimensionConfig.name];
			if (!Dimension) throw new XError(XError.INVALID_ARGUMENT, 'Invalid dimension specified');
			dimensions.push(new Dimension(dimensionConfig.tokenConfig || {}));
		}
		return new Polytype(dimensions);
	}

}

module.exports = Polytoken;
