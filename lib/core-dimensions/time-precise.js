const NumericDimension = require('./numeric');
const utils = require('../utils');

class TimeDetailedDimension extends NumericDimension {
	// TODO
	// Range should be a 2-tuple of dates forming a time range. Point should be a single date. Let's talk about
	// what tokenConfig should look like.

	constructor(tokenConfig) {
		super('TimePrecise', tokenConfig);
	}

	validateRange(range) {
		return utils.validateDateRange(range);
	}

	validatePoint(point) {
		return utils.validateDatePoint(point);
	}

	normalizeRange(range) {
		this.validateRange(range);
		return range.map((entry) => {
			return typeof entry === 'number' ? entry : (new Date(entry)).getTime();
		});
	}

	normalizePoint(point) {
		this.validatePoint(point);
		return typeof point === 'number' ? point : (new Date(point)).getTime();
	}

	checkRangeInclusion(range, point) {
		range = this.normalizeRange(range);
		point = this.normalizePoint(point);
		if (point < range[0] || point > range[1]) return false;
		return true;
	}

}

module.exports = TimeDetailedDimension;
