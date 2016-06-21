const _ = require('lodash');
const Dimension = require('../dimension');
const XError = require('xerror');

class NumericDimension extends Dimension {
	// TODO
	// Simplest dimension which is also least likely to be useful. Range should be a numeric range of
	// the form [ 2, 6 ], and point should be a single number, e.g. 4.5. Let's talk about what token config should
	// look like. Would recommend implementing this first, as it should be the easiest.

	validateRange(range) {
		if (!Array.isArray(range)) {
			throw new XError(XError.INVALID_RANGE, `Range of ${this.name} dimension should be an array`);
		}
		if (range.length !== 2) {
			throw new XError(XError.INVALID_RANGE, `Range of ${this.name} dimension should have length of two`);
		}
		if (typeof range[0] !== 'number' || typeof range[1] !== 'number') {
			throw new XError(XError.INVALID_RANGE, `Range of ${this.name} dimension should consist of numbers`);
		}
		if (range[1] <= range[0]) {
			throw new XError(XError.INVALID_RANGE,
				`upper bound of ${this.name} dimension must be greater than range lower bound`);
		}
		return true;
	}

	validatePoint(point) {
		if (typeof point !== 'number') throw new XError(XError.INVALID_POINT, 'Numeric point should be a number');
		return true;
	}

	getRangeTokens(range) {
		range = this.normalizeRange(range);
		let [ min, max ] = range;
		return this._getRangeTokens(min, max, 0, []);
	}

	/**
	 * Recursively iterate over steps and generate tokens based on each step for the given range
	 * @method _getRangeTokens
	 * @private
	 * @param {Number} min - the lower bound of the range
	 * @param {Number} max - the upper bound of the range
	 * @param {Number[]} steps - the steps array
	 * @param {Number} curStepIndex - index of current step in the step array
	 * @param {String[]} tokens - the array of generated tokens
	 * @return {String[]} - return the array of generated tokens
	 */
	_getRangeTokens(min, max, curStepIndex, tokens = []) {
		let steps = this.steps;
		let length = max - min;
		// return when all steps are iterated over
		if (curStepIndex >= steps.length) {
			let step = steps[steps.length - 1];
			// generate an additional token to cover the left over range
			if (length > 0) {
				let pivot = Math.floor(min / step) * step;
				let stepNum = Math.ceil((max - pivot) / step);
				for (let i = 1; i <= stepNum; i++) {
					tokens.push(`${Math.floor(pivot / step) * step}^${step}`);
					pivot += step;
				}
			}
			return tokens;
		}
		let step = steps[curStepIndex];
		// return when the whole range is already covered by generated tokens
		if (length <= 0) return tokens;
		// Go to the next (smaller) step if current step is greater than range
		if (step > length) {
			return this._getRangeTokens(min, max, curStepIndex + 1, tokens);
		}
		let pivot;
		if (min >= 0) {
			pivot = min % step ? min + (step - min % step) : min;
		} else {
			pivot = min - min % step;
		}
		let originalPivot = pivot;
		let numSteps = Math.floor((max - pivot) / step);
		for (let i = 1; i <= numSteps; i++) {
			tokens.push(`${pivot}^${step}`);
			pivot += step;
		}
		return this._getRangeTokens(pivot, max, curStepIndex + 1, tokens)
			.concat(this._getRangeTokens(min, originalPivot, curStepIndex + 1, []));
	}

	getTokensForPoint(point) {
		point = this.normalizePoint(point);
		return _.map(this.steps, (step) => `${Math.floor(point / step) * step}^${step}`);
	}
}

module.exports = NumericDimension;
