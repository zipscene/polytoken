const gjv = require('geojson-validation');
const XError = require('xerror');
const Dimension = require('../dimension');
const geometry = require('../geometry');

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
		if (tokenConfig.step.type !== 'exponential') {
			throw new XError(XError.INVALID_ARGUMENT, 'step type must be exponential for long-lat dimension');
		}
		super('long-lat', tokenConfig);
	}

	/**
	 * Validate given range is a GeoJSON object with type 'Polygon' and has valid coordinates
	 *
	 * @method validateRange
	 * @param {Object} range - A GeoJSON polygon object
	 * @return {Boolean} - returns true if it's valid
	 */
	validateRange(range) {
		if (!gjv.isGeoJSONObject(range)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid geojson object`);
		}
		if (!gjv.isPolygon(range)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid polygon`);
		}
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
		if (!gjv.isGeoJSONObject(point)) {
			throw new XError(XError.INVALID_POINT, `point of ${this.name} dimension is not a valid geojson object`);
		}
		if (!gjv.isPoint(point)) {
			throw new XError(XError.INVALID_POINT, `point of ${this.name} dimension is not a valid point`);
		}
		return true;
	}

	// convert linearRings that touches/covers pole
	normalizeRange(range) {
		this.validateRange(range);
		for (let linearRing of range.coordinates) {
			if (linearRing.length === 2) {
				// covers/touches pole
				if (linearRing.some(([ , lat ]) => lat === 90 || lat === -90)) {
					linearRing.splice(1, 0, [ linearRing[1][0], linearRing[0][1] ]);
					linearRing.push(linearRing[0][0], linearRing[2][1]);
				} else {
					throw new XError(XError.INVALID_RANGE, 'boundry of polygon is not a closed linearRing');
				}
			}
		}
		return range;
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
		let interiors = range.coordinates.slice(1);
		let [ x, y ] = topLeftVertex;
		let tokens = [];
		let intersection = [];
		let breakLoop = true;
		// Iterate through all tokens of each step that's approximately within the bounding box. if the current token
		// is inside the bounding box, push it to the `tokens` array. If it intersects with the bounding box, push it
		// to the `intersection` array. If it's outside the bounding box, ignore and contunue. Note that once we find
		// a level of that has intersection tokens, we break the loop and search one level down in steps for tokens that
		// intersect with bounding box
		for (let k = 0; k < this.steps.length; k++) {
			let step = this.steps[k];
			// Calculate the maximmum number of tokens of current step that can fit in the bounding box horizaontally.
			// Note that tokens can't begin at a point whose coordinates are not divisible by the current step. Thus,
			// the maximmum number of steps is width divided by step, but actually width plus the residual between the
			// x coordinate of top left vertex of bounding box and the x coordinate of top left vertex of token
			let iMax = x >= 0 ? (width + x % step) / step : (width + (x % step ? step + x % step : 0)) / step;
			for (let i = 0; i < iMax; i++) {
				let currentX = x >= 0 ? x - x % step + i * step : x - (x % step ? step + x % step : 0) + i * step;
				// Calculate the maximmum number of tokens of current step that can fit in the bounding box vertically.
				// Similar to iMax
				let jMax = y >= 0 ? (height + step - y % step) / step : (height - y % step) / step;
				for (let j = 0; j < jMax; j++) {
					let currentY = y >= 0 ? y + (y % step ? step - y % step : 0) - j * step : y - y % step - j * step;
					let square = [ [ currentX, currentY ], [ currentX + step, currentY ],
						[ currentX + step, currentY - step ], [ currentX, currentY - step ], [ currentX, currentY ] ];
					let state = geometry.squareLinearRingIntersectState(range.coordinates[0],
						[ currentX, currentY ], step);
					// Token is inside exterior of the polygon
					if (state === 'inside') {
						breakLoop = false;
						let isInsideInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'inside';
						});
						let isIntersectInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'intersect'
								|| geometry.getLinearRingsIntersectState(square, interior) === 'inside';
						});
						if (isInsideInterior) {
							// Ignore this token if it's inside one of the interiors
							continue;
						} else if (isIntersectInterior) {
							// Token is considered to be intersecting with the polygon if it intersects with interior
							intersection.push([ currentX, currentY ]);
						} else {
							// Push token that's inside exterior and outside interiors into `tokens`
							tokens.push(`${currentX},${currentY}^${step}`);
						}
					} else if (state === 'intersect') {
						breakLoop = false;
						intersection.push([ currentX, currentY ]);
					}
				}
			}
			if (!breakLoop) {
				// Begin searching tokens inside intersecting tokens
				this._getRangeTokens(range, intersection, k + 1, tokens);
				break;
			}
		}

		return tokens;
	}

	/**
	 * Given an array of tokens that intersect with given range, recursively go one level down of steps
	 * and find tokens of given step that are inside the given range, save these tokens in `tokens`
	 * array. Save newly found intersecting tokens of current step and go to next level.
	 *
	 * @method _getRangeTokens
	 * @private
	 * @param {Object} range - GeoJSON polygon object
	 * @param {Number[][]} intersection - array of points that are top left vertex of tokens of current step
	 * @param {Numner} stepIndex - index of current step in `this.steps`
	 * @param {String[]} tokens - array of token strings
	 */
	_getRangeTokens(range, intersection, stepIndex, tokens) {
		if (intersection.length === 0) return;
		if (stepIndex >= this.steps.length) {
			for (let [ x, y ] of intersection) {
				tokens.push(`${x},${y}^${this.steps[this.steps.length - 1]}`);
			}
			return;
		}
		let interiors = range.coordinates.slice(1);
		let step = this.steps[stepIndex];
		let newIntersection = [];
		for (let [ x, y ] of intersection) {
			for (let i = 0; i < this.tokenConfig.step.exponent; i++) {
				let currentX = x + i * step;
				for (let j = 0; j < this.tokenConfig.step.exponent; j++) {
					let currentY = y - j * step;
					let square = [ [ currentX, currentY ], [ currentX + step, currentY ],
						[ currentX + step, currentY - step ], [ currentX, currentY - step ], [ currentX, currentY ] ];
					let state = geometry.squareLinearRingIntersectState(
						range.coordinates[0], [ currentX, currentY ], step);
					if (state === 'inside') {
						let isInsideInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'inside';
						});
						let isIntersectInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'intersect'
								|| geometry.getLinearRingsIntersectState(square, interior) === 'inside';
						});
						if (isInsideInterior) {
							continue;
						} else if (isIntersectInterior) {
							newIntersection.push([ currentX, currentY ]);
						} else {
							tokens.push(`${currentX},${currentY}^${step}`);
						}
					} else if (state === 'intersect') {
						newIntersection.push([ currentX, currentY ]);
					}
				}
			}
		}
		this._getRangeTokens(range, newIntersection, stepIndex + 1, tokens);
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
		let [ pointX, pointY ] = point.coordinates;
		let complementPointX = 0;
		complementPointX = pointX > 0 ? pointX - 360 : pointX + 360;
		let tokens = [];
		for (let step of this.steps) {
			let x = Math.floor(pointX / step) * step;
			let y = Math.floor(pointY / step) * step + step;
			tokens.push(`${x},${y}^${step}`);

			// Also generate tokens for complement x coordinate of the point. For example,
			// if the point's coordinates are [ 178, 2 ], then the complement coordinates are
			// [ -182, 2 ]. This is necessary to match up polygons go across meridian
			let complementX = Math.floor(complementPointX / step) * step;
			tokens.push(`${complementX},${y}^${step}`);

			let x2, y2, complementX2;
			if (pointX % step === 0) {
				x2 = Math.floor(pointX / step) * step - step;
				tokens.push(`${x2},${y}^${step}`);
			}
			if (complementPointX % step === 0) {
				complementX2 = Math.floor(complementX / step) * step - step;
				tokens.push(`${complementX2},${y}^${step}`);
			}
			if (pointY % step === 0) {
				y2 = Math.floor(pointY / step) * step;
				tokens.push(`${x},${y2}^${step}`);
				tokens.push(`${complementX},${y2}^${step}`);
				if (x2 !== undefined) { tokens.push(`${x2},${y2}^${step}`); }
				if (complementX2 !== undefined) { tokens.push(`${complementX2},${y2}^${step}`); }
			}
		}
		return tokens;
	}
}

module.exports = LongLatDimension;
