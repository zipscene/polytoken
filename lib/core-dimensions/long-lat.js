const XError = require('xerror');
const Dimension = require('../dimension');
const geometry = require('../geometry');
const utils = require('../utils');
const geolib = require('geolib');

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

	normalizePoint(point) {
		return utils.normalizeLongLatPoint(point);
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
		let tokenSet = {};
		if (range.point && range.radius) {
			// Treat as point/radius pair
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
		} else {
			// Treat as polygon
			if (range.type === 'Polygon') {
				geometry.genRangeTokensForPolygon(range.coordinates, this.steps, tokenSet);
			} else if (range.type === 'MultiPolygon') {
				let multiCoordinates = range.coordinates || [];
				for (let coordinates of multiCoordinates) {
					geometry.genRangeTokensForPolygon(coordinates, this.steps, tokenSet);
				}
			}
		}
		return Object.keys(tokenSet);
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
		return utils.genTokensForLongLatPoint(point, this.steps);
	}

	checkRangeInclusion(range, point) {
		range = this.normalizeRange(range);
		point = this.normalizePoint(point);
		if (range.point && range.radius) {
			// Treat as point/radius
			let geolibRangeCenter = { longitude: range.point.coordinates[0], latitude: range.point.coordinates[1] };
			let geolibPoint = { longitude: point.coordinates[0], latitude: point.coordinates[1] };
			let distance = geolib.getDistance(geolibRangeCenter, geolibPoint);
			return (distance <= range.radius);
		} else {
			// Treat as polygon
			return geometry.isPointInsidePolygon(point, range);
		}
	}
}

module.exports = LongLatDimension;
