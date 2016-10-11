const XError = require('xerror');
const Dimension = require('../dimension');
const geometry = require('../geometry');
const utils = require('../utils');
const objtools = require('zs-objtools');
const geolib = require('geolib');

/**
 * Dimension that deals with points and space on a geo grid (like the LongLatDimension), but ranges
 * are expressed as a point and a radius rather than a polygon.
 *
 * @constructor
 * @param {Object} tokenConfig
 *   @param {object} tokenConfig.step
 *     @param {String} tokenConfig.step.type - type can only be 'exponential'
 *     @param {Number} base - the base of step
 *     @param {Number} stepNum - number of available steps
 */
class LongLatRadiusDimension extends Dimension {
	constructor(tokenConfig) {
		super('LongLatRadius', tokenConfig);
	}

	/**
	 * Validate given range is a GeoJSON object with type 'Polygon' and has valid coordinates
	 *
	 * @method validateRange
	 * @param {Object} range - An object like { point: [ LONG, LAT ], radius: RADIUS_IN_METERS }
	 * @return {Boolean} - returns true if it's valid
	 */
	validateRange(range) {
		if (!range.point || !range.radius || typeof range.radius !== 'number') {
			throw new XError(XError.INVALID_RANGE, 'Invalid LongLatRadius range');
		}
		utils.validateLongLatPoint(range.point);
		return true;
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

	normalizeRange(range) {
		range = objtools.deepCopy(range);
		this.validateRange(range);
		range.point = utils.normalizeLongLatPoint(range.point);
		return range;
	}

	normalizePoint(point) {
		return utils.normalizeLongLatPoint(point);
	}

	/**
	 * Get all tokens covered by given range
	 *
	 * @method getRangeTokens
	 * @param {Object} range
	 * @return {String[]} - returns an array of generated token strings in following format `long,lat^step`
	 */
	getRangeTokens(range) {
		range = this.normalizeRange(range);
		let tokenSet = {};
		// Construct polygon that encompasses the circle
		let long = range.point.coordinates[0];
		let lat = range.point.coordinates[1];
		let radius = range.radius;
		let geolibPoint = { latitude: lat, longitude: long };
		let latNorth = geolib.computeDestinationPoint(geolibPoint, radius, 0).latitude;
		let latSouth = geolib.computeDestinationPoint(geolibPoint, radius, 180).latitude;
		let longEast = geolib.computeDestinationPoint(geolibPoint, radius, 90).longitude;
		let longWest = geolib.computeDestinationPoint(geolibPoint, radius, 270).longitude;
		let rangePolygonCoordinates = [ [
			[ longWest, latNorth ],  // TL
			[ longEast, latNorth ],  // TR
			[ longEast, latSouth ],  // BR
			[ longWest, latSouth ],  // BL
			[ longWest, latNorth ]   // TL
		] ];
		// Get tokens from constructed polygon
		geometry.genRangeTokensForPolygon(rangePolygonCoordinates, this.steps, tokenSet);
		return Object.keys(tokenSet);
	}

	/**
	 * Get all tokens covering current point
	 *
	 * @method getTokensForPoint
	 * @param {Object}
	 * @return {String[]} - return an array of tokens
	 */
	getTokensForPoint(point) {
		point = this.normalizePoint(point);
		return utils.genTokensForLongLatPoint(point, this.steps);
	}

	checkRangeInclusion(range, point) {
		point = this.normalizePoint(point);
		range = this.normalizeRange(range);
		let geolibRangeCenter = { longitude: range.point.coordinates[0], latitude: range.point.coordinates[1] };
		let geolibPoint = { longitude: point.coordinates[0], latitude: point.coordinates[1] };
		let distance = geolib.getDistance(geolibRangeCenter, geolibPoint);
		return (distance <= range.radius);
	}
}

module.exports = LongLatRadiusDimension;
