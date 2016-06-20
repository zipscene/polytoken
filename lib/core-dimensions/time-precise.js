const NumericDimension = require('./numeric');

class TimeDetailedDimension extends NumericDimension {
	// TODO
	// Range should be a 2-tuple of dates forming a time range. Point should be a single date. Let's talk about
	// what tokenConfig should look like.

	constructor(tokenConfig) {
		super('TimePrecise', tokenConfig);
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

	validatePoint(point) {
		try {
			let date = new Date(point);
		} catch (ex) {
			throw new XError(XError.INVALID_POINT,
				'time point should be a timestamp or a date string or an instance of Date');
		}
		return true;
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
}

module.exports = TimeDetailedDimension;
