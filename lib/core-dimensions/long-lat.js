const Dimension = require('../dimension');

class LongLatDimension extends Dimension {
	// TODO
	// Range should be a GeoJSON polygon. Point should be a long-lat set, e.g. [ -34.6, 48.1 ]. tokenConfig will
	// represent an exponential step size; it should contain a step size (must be integer!), step size, and
	// length of the smallest tokenized box in degrees.
	// Note base step size is in 1/10000 degrees instead of degrees. This is because 1 degree ~= 110km, which is
	// too large to be the base size
	constructor(name) {
		super('long-lat', {
			step: {
				type: 'exponential',
				base: 2,
				stepNum: 10
			}
		});

		validateRange(range) {
			
		}
	}
}

module.exports = LongLatDimension;
