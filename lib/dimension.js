const XError = require('xerror');

/**
 * This is the base class for polytoken dimensions. A dimension is a segmentable space that is combined with
 * other dimensions to form a polytype. Examples include time and 1D, 2D, or 3D space. This class should not
 * be instantiated directly.
 *
 * @class Dimension
 * @constructor
 * @param {Mixed} tokenConfig - Configuration for how tokens should be generated for this class. Its format depends
 *   on the sublcass. For example, if the tokens for a subclass increase in size exponentially by a constant factor,
 *   then this config would contain the exponent, a base size, and the maximum number of steps. The same tokenConfig
 *   MUST be provided to this class each time it is used to get consistent results.
 */
class Dimension {

	constructor(tokenConfig) {
		this.tokenConfig = tokenConfig;
	}

	/**
	 * (Possibly not needed)
	 * Validate an input range object of this dimension type. For example, a range of a LongLat type would be
	 * a geoJSON Polygon.
	 *
	 * @method validateRange
	 * @throws XError
	 * @param {Mixed} range
	 * @return {Boolean} true
	 */
	validateRange(range) {
		return true;
	}

	/**
	 * (Possibly not needed)
	 * Validate an input point object of this dimension type. For example, a point of a LongLat type would be
	 * a [ longitude, latitude ] tuple.
	 *
	 * @method validatePoint
	 * @throws XError
	 * @param {Mixed} point
	 * @return {Boolean} true
	 */
	validatePoint(point) {
		return true;
	}

	/**
	 * Generate and return a set of tokens that contain the given range object as accurately as possible. The
	 * number of tokens returned is ideally as small as possible.
	 *
	 * @method getRangeTokens
	 * @param {Mixed} range
	 * @return {Array[String]} tokens - Set of tokens which comprise this range.
	 */
	getRangeTokens(range) {
		throw new XError(XError.UNSUPPORTED_OPERATION);
	}

	/**
	 * Return the set of tokens to which this point can potentially belong. For example, in the case of the LongLat
	 * dimension, for each step size, return the token of that size that contains this point. Any tokenized range
	 * that contains at least one of these tokens also contains this point.
	 *
	 * @method getTokensForPoint
	 * @param {Mixed} point
	 * @return {Array[String]} tokens - Set of tokens which contain this point.
	 */
	getTokensForPoint(point) {
		throw new XError(XError.UNSUPPORTED_OPERATION);
	}

}

module.exports = Dimension;
