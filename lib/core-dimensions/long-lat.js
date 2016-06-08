const gjv = require('geojson-validation');
const XError = require('xerror');
const Dimension = require('../dimension');
const geometry = require('../geometry');

class LongLatDimension extends Dimension {
	// TODO
	// Range should be a GeoJSON polygon. Point should be a long-lat set, e.g. [ -34.6, 48.1 ]. tokenConfig will
	// represent an exponential step size; it should contain a step size (must be integer!), step size, and
	// length of the smallest tokenized box in degrees.
	constructor(tokenConfig) {
		if (tokenConfig.step.type !== 'exponential') {
			throw new XError(XError.INVALID_ARGUMENT, 'step type must be exponential for long-lat dimension');
		}
		super('long-lat', tokenConfig);
	}

	validateRange(range) {
		if (!gjv.isGeoJSONObject(range)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid geojson object`);
		}
		if (!gjv.isPolygon(range)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid polygon`);
		}
		return true;
	}

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

	getRangeTokens(range) {
		range = this.normalizeRange(range);
		let { topLeftVertex, width, height } = geometry.getBoundingBox(range.coordinates[0]);
		let interiors = range.coordinates.slice(1);
		let [ x, y ] = topLeftVertex;
		let tokens = [];
		let intersection = [];
		let checkNextStep = true;
		for (let k = 0; k < this.steps.length; k++) {
			let step = this.steps[k];
			let iMax = x >= 0 ? (width + x % step) / step : (width + (x % step ? step + x % step : 0)) / step;
			for (let i = 0; i < iMax; i++) {
				let currentX = x >= 0 ? x - x % step + i * step : x - (x % step ? step + x % step : 0) + i * step;
				let jMax = y >= 0 ? (height + step - y % step) / step : (height - y % step) / step;
				for (let j = 0; j < jMax; j++) {
					let currentY = y >= 0 ? y + (y % step ? step - y % step : 0) - j * step : y - y % step - j * step;
					let square = [ [ currentX, currentY ], [ currentX + step, currentY ],
						[ currentX + step, currentY - step ], [ currentX, currentY - step ], [ currentX, currentY ] ];
					let state = geometry.squareLinearRingIntersectState(range.coordinates[0],
						[ currentX, currentY ], step);
					if (state === 'inside') {
						checkNextStep = false;
						let isInsideInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'inside';
						});
						let isIntersectInterior = interiors.some((interior) => {
							return geometry.squareLinearRingIntersectState(interior,
								[ currentX, currentY ], step) === 'intersect'
								|| geometry.getLinearRingsIntersectState(square, interior);
						});
						if (isInsideInterior) {
							continue;
						} else if (isIntersectInterior) {
							intersection.push([ currentX, currentY ]);
						} else {
							if (currentX > 180) currentX = currentX - 360;
							if (currentX < -180) currentX = 360 + currentX;
							if (currentY > 90) currentY = currentY - 180;
							if (currentY < -90) currentY = 180 + currentY;
							tokens.push(`${currentX},${currentY}^${step}`);
						}
					} else if (state === 'intersect') {
						checkNextStep = false;
						intersection.push([ currentX, currentY ]);
					}
				}
			}
			if (!checkNextStep) {
				this._getRangeTokens(range, intersection, k + 1, tokens);
				break;
			}
		}

		return tokens;
	}

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
							if (currentX > 180) currentX = currentX - 360;
							if (currentX < -180) currentX = 360 - currentX;
							if (currentY > 90) currentY = currentY - 180;
							if (currentY < -90) currentY = 180 + currentY;
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

	getTokensForPoint(point) {
		range = this.normalizePoint(point);
		let tokens = [];
		for (let step of this.steps) {
			let x = Math.floor(point[0] / step);
			let y = Math.floor(point[1] / step);
			tokens.push(`${x},${y}^${step}`);
		}
		return tokens;
	}
}

module.exports = LongLatDimension;
