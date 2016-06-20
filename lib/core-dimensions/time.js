const XError = require('xerror');
const Dimension = require('../dimension');
const moment = require('moment');

class TimeDimension extends Dimension {

	constructor(tokenConfig) {
		super('Time', tokenConfig);
	}

	validateRange(range) {
		if (!Array.isArray(range)) {
			throw new XError(XError.INVALID_RANGE, 'Range of time dimension should be an array');
		}
		if (range.length !== 2) {
			throw new XError(XError.INVALID_RANGE, 'Range of time dimension should have length of two');
		}
		let [ begin, end ] = range.map((entry) => {
			let date;
			try {
				date = new Date(entry);
			} catch (ex) {
				throw new XError(XError.INVALID_POINT,
					'time point should be a timestamp or a date string or an instance of Date');
			}
			return date;
		});
		if (end.getTime() <= begin.getTime()) {
			throw new XError(XError.INVALID_RANGE, 'upper bound of time dimension must be greater than lower bound');
		}
		return true;
	}

	normalizeRange(range) {
		this.validateRange(range);
		return [ moment(range[0]).toDate(), moment(range[1]).toDate() ];
	}

	validatePoint(point) {
		try {
			let date = new Date(point);
		} catch (ex) {
			throw new XError(XError.INVALID_POINT,
				'time point should be a timestamp or a date string or an instance of Date');
		}
		return true;
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
		let rangeDifference = secondRange[1] - secondRange[0];
		// Find smallest token size that is larger than the range size
		let step = this.steps[0];
		for (let i = 1; i < this.steps.length; i++) {
			if (rangeDifference > this.steps[i]) {
				step = this.steps[i];
			} else {
				break;
			}
		}
		// Get token starting index
		let tokenIndex = secondRange[0] - (secondRange[0] % step);
		tokenIndex = Math.round(tokenIndex * 10000) / 10000;
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
			let tokenIndex = Math.floor(pointSeconds / step) * step;
			tokenIndex = Math.round(tokenIndex * 10000) / 10000;
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
