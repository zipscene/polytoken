const gjv = require('geojson-validation');
const XError = require('xerror');
const Dimension = require('../dimension');

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
		if (!gtv.isPolygon(range)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid polygon`);
		}
		return true;
	}

	validatePoint(point) {
		if (!gjv.isGeoJSONObject(point)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid geojson object`);
		}
		if (!gtv.isPoint(point)) {
			throw new XError(XError.INVALID_RANGE, `range of ${this.name} dimension is not a valid point`);
		}
		return true;
	}

	getRangeTokens(range) {

	}

	getTokensForPoint(point) {

	}
}

module.exports = LongLatDimension;
