// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

const XError = require('xerror');
const { roundToFiveSignificantDigits } = require('../lib/utils');

/**
 * This is the base class for polytoken dimensions. A dimension is a segmentable space that is combined with
 * other dimensions to form a polytype. Examples include time and 1D, 2D, or 3D space. This class should not
 * be instantiated directly. A dimension keeps a certain range of steps amd generate tokens based on these steps.
 *
 * @class Dimension
 * @constructor
 * @param {String} name - name of the dimension
 * @param {Object} tokenConfig - Configuration object for how tokens should be generated for this class.
 *  @param {Object} tokenConfig.step - specifies how steps are generated. Two step types are supported:
 * 'exponential' and 'customized'. If steps grow exponentially, the step object will look like this:
 * { type: 'exponential', base: 2, stepNum: 8 }, where `base` is the base step to begin with. `stepNum`
 * is the number of steps this dimension. In this case, the dimension should generate steps from 2^1 to
 * 2^8. A customized step configuration object looks like this: { type: 'customized', steps: [...] }
 */
class Dimension {

	constructor(name, tokenConfig) {
		this.name = name;
		this.tokenConfig = tokenConfig;
		this.globalToken = !!tokenConfig.globalToken;
		this.steps = [];

		if (!tokenConfig.step) throw new XError(XError.INVALID_ARGUMENT, 'Missing step configuration');
		if (tokenConfig.step.type === 'exponential') {
			if (!tokenConfig.step.base) {
				throw new XError(XError.INVALID_ARGUMENT, 'Missing base for exponential step config');
			}
			if (!tokenConfig.step.stepNum) {
				throw new XError(XError.INVALID_ARGUMENT, 'Missing total number of steps in config');
			}
			if (typeof tokenConfig.step.base !== 'number') {
				throw new XError(XError.INVALID_ARGUMENT, 'Base for exponential step must be a number');
			}
			if (typeof tokenConfig.step.multiplier !== 'number' || tokenConfig.step.multiplier % 1 !== 0) {
				throw new XError(XError.INVALID_ARGUMENT, 'multiplier must be an integer');
			}
			if (typeof tokenConfig.step.stepNum !== 'number') {
				throw new XError(XError.INVALID_ARGUMENT, 'stepNum must be a number');
			}

			for (let i = tokenConfig.step.stepNum - 1; i >= 0; i--) {
				this.steps.push(
					roundToFiveSignificantDigits(tokenConfig.step.base * Math.pow(tokenConfig.step.multiplier, i)));
			}
		} else if (tokenConfig.step.type === 'customized') {
			if (!tokenConfig.step.steps) {
				throw new XError(XError.INVALID_ARGUMENT, 'Missing steps for customized step config');
			}
			if (!Array.isArray(tokenConfig.step.steps)) {
				throw new XError(XError.INVALID_ARGUMENT, 'Steps must be an array');
			}
			for (let step of tokenConfig.step.steps) {
				if (typeof step !== 'number') {
					throw new XError(XError.INVALID_ARGUMENT, 'Steps must be an array of numbers');
				}
				if (step <= 0) throw new XError(XError.INVALID_ARGUMENT, 'steps must be greater than 0');
			}
			this.steps = tokenConfig.step.steps;
		} else {
			throw new XError(XError.INVALID_ARGUMENT, `Unrecoginzed step type ${tokenConfig.step.type}`);
		}

		// make sure the steps array is in descending order
		this.steps.sort((a, b) => b - a);
	}

	/**
	 * Get name of the dimension
	 * @method getName
	 * @return {String} - return the name of the dimension
	 */
	getName() {
		return this.name;
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
	validateRange(/*range*/) {
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
	validatePoint(/*point*/) {
		return true;
	}

	/**
	 * Normalize range
	 *
	 * @method normalizeRange
	 * @param {Mixed} range - a range of this dimension
	 * @return {Mixed} - return normalzied range
	 */
	normalizeRange(range) {
		this.validateRange(range);
		return range;
	}

	/**
	 * Normalize point
	 *
	 * @method normalizePoint
	 * @param {Mixed} point - a point of this dimension
	 * @return {Mixed} - return the normalzied point
	 */
	normalizePoint(point) {
		this.validatePoint(point);
		return point;
	}

	/**
	 * Generate and return a set of tokens that contain the given range object as accurately as possible. The
	 * number of tokens returned is ideally as small as possible.
	 *
	 * @method getRangeTokens
	 * @param {Mixed} range
	 * @return {Array[String]} tokens - Set of tokens which comprise this range.
	 */
	getRangeTokens(/*range*/) {
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
	getTokensForPoint(/*point*/) {
		throw new XError(XError.UNSUPPORTED_OPERATION);
	}

	/**
	 * Perform a definitive test on whether the given range includes the given point.
	 *
	 * @method checkRangeInclusion
	 * @param {Mixed} range
	 * @param {Mixed} point
	 * @return {Boolean} - True if the point is inside the range, false otherwise.
	 */
	checkRangeInclusion(/*range, point*/) {
		throw new XError(XError.UNSUPPORTED_OPERATION);
	}

}

module.exports = Dimension;
