const XError = require('xerror');
const Dimension = require('../dimension');
const geometry = require('../geometry');
const utils = require('../utils');

/**
 * Dimension that deals with 2-dimensional geometries in longitude and latitude
 * Both range and point should be a valid GeoJSON point.
 *
 * @constructor
 * @param {Object} tokenConfig
 *   @param {object} tokenConfig.step
 *     @param {String} tokenConfig.step.type - type can only be 'exponential'
 *     @param {Number} base - the base of step
 *     @param {Number} stepNum - number of available steps
 */
class LongLatDimension extends Dimension {
	constructor(tokenConfig) {
		super('LongLat', tokenConfig);
	}

	/**
	 * Validate given range is a GeoJSON object with type 'Polygon' and has valid coordinates
	 *
	 * @method validateRange
	 * @param {Object} range - A GeoJSON polygon object
	 * @return {Boolean} - returns true if it's valid
	 */
	validateRange(range) {
		return utils.validateLongLatRange(range);
	}

	/**
	 * Validate given point is a GeoJSON object with type 'Point' and has valid coordinates
	 *
	 * @method validateRange
	 * @param {Object} point - A GeoJSON point object
	 * @return {Boolean} - returns true if it's valid
	 */
	validatePoint(point) {
		return utils.validateLongLatPoint(point);
	}

	// convert linearRings that touches/covers pole
	normalizeRange(range) {
		return utils.normalizeLongLatRange(range);
	}

	/**
	 * Get all tokens covered by given range
	 *
	 * @method getRangeTokens
	 * @param {Object} range - GeoJSON polygon object
	 * @return {String[]} - returns an array of generated token strings in following format `long,lat^step`
	 */
	getRangeTokens(range) {
		range = this.normalizeRange(range);
		let { topLeftVertex, width, height } = geometry.getBoundingBox(range.coordinates[0]);
		let maxEdgeLength = width > height ? width : height;
		let step;
		for (let i = this.steps.length - 1; i >= 0; i--) {
			if (this.steps[i] >= maxEdgeLength) {
				step = this.steps[i];
				break;
			}
		}
		if (!step) step = this.steps[0];
		let [ x, y ] = topLeftVertex;
		let topLeftX = x;
		let topLeftY = y;
		if (x % step) {
			x = utils.roundToFiveSignificantDigits(x >= 0 ? x - x % step : x - (step + x % step));
		}
		if (y % step) {
			y = utils.roundToFiveSignificantDigits(y >= 0 ? y + (step - y % step) : y - (y % step));
		}
		let tokens = [];
		for (let currentX = x; currentX < topLeftX + width; currentX += step) {
			for (let currentY = y; currentY > topLeftY - height; currentY -= step) {
				if (currentX >= -180 && currentX <= 180) {
					tokens.push(`${currentX},${currentY}^${step}`);
				} else if (currentX < -180) {
					tokens.push(`${360 + currentX},${currentY}^${step}`);
				} else {
					tokens.push(`${currentX - 360},${currentY}^${step}`);
				}
			}
		}
		return tokens;
	}

	/**
	 * Get all tokens covering current point
	 *
	 * @method getTokensForPoint
	 * @param {Object} - GeoJSON point object
	 * @return {String[]} - return an array of tokens
	 */
	getTokensForPoint(point) {
		point = this.normalizePoint(point);
		return genTokensForLongLatPoint(point);
	}

	checkRangeInclusion(range, point) {
		return geometry.isPointInsidePolygon(point, range);
	}
}

module.exports = LongLatDimension;
