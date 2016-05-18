const Dimension = require('../dimension');

class LongLatDimension extends Dimension {
	// TODO
	// Range should be a GeoJSON polygon. Point should be a long-lat set, e.g. [ -34.6, 48.1 ]. tokenConfig will
	// represent an exponential step size; it should contain a step size (must be integer!), step size, and
	// length of the smallest tokenized box in degrees.
}

module.exports = LongLatDimension;
