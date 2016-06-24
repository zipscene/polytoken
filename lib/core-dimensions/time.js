const XError = require('xerror');
const Dimension = require('../dimension');
const moment = require('moment');
const { roundToFiveSignificantDigits, validateDateRange, validateDatePoint } = require('../utils');

class TimeDimension extends Dimension {

	constructor(tokenConfig) {
		super('Time', tokenConfig);
	}

	validateRange(range) {
		return validateDateRange(range);
	}

	normalizeRange(range) {
		this.validateRange(range);
		return [ moment(range[0]).toDate(), moment(range[1]).toDate() ];
	}

	validatePoint(point) {
		return validateDatePoint(point);
	}

	normalizePoint(point) {
		this.validatePoint(point);
		return moment(point).toDate();
	}

	getRangeTokens(range) {
		range = this.normalizeRange(range);
		// Token unit = seconds since UTC epoch
		let secondRange = range.map((date) => {
			return Math.floor(date.getTime() / 1000);
		});
		let rangeDifference = roundToFiveSignificantDigits(secondRange[1] - secondRange[0]);
		// Find smallest token size that is larger than the range size
		let step = this.steps[0];
		for (let i = 1; i < this.steps.length; i++) {
			if (rangeDifference > this.steps[i]) {
				break;
			} else {
				step = this.steps[i];
			}
		}
		// Get token starting index
		let tokenIndex = roundToFiveSignificantDigits(secondRange[0] - (secondRange[0] % step));
		// Push tokens till there aint no more
		let tokens = [];
		while (tokenIndex < secondRange[1]) {
			tokens.push(`${tokenIndex}^${step}`);
			tokenIndex += step;
		}
		return tokens;
	}

	getTokensForPoint(point) {
		point = this.normalizePoint(point);
		let pointSeconds = Math.floor(point.getTime() / 1000);
		let tokens = [];
		for (let step of this.steps) {
			let tokenIndex = roundToFiveSignificantDigits(Math.floor(pointSeconds / step) * step);
			tokens.push(`${tokenIndex}^${step}`);
		}
		return tokens;
	}

	checkRangeInclusion(range, point) {
		range = this.normalizeRange(range);
		point = this.normalizePoint(point);
		if (point.getTime() < range[0].getTime() || point.getTime() > range[1].getTime()) return false;
		return true;
	}

}

module.exports = TimeDimension;
