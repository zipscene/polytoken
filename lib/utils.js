const gjv = require('geojson-validation');
const XError = require('xerror');
const geometry = require('./geometry');

function roundToFiveSignificantDigits(number) {
	return ~~number === number ? number : Math.round(number * 100000) / 100000;
}
exports.roundToFiveSignificantDigits = roundToFiveSignificantDigits;

function validateLongLatRange(range) {
	if (!gjv.isGeoJSONObject(range)) {
		throw new XError(XError.INVALID_RANGE, 'range of long-lat dimension is not a valid geojson object');
	}
	if (!gjv.isPolygon(range) && !gjv.isMultiPolygon(range)) {
		throw new XError(XError.INVALID_RANGE, 'range of long-lat dimension is not a valid polygon');
	}
	return true;
}
exports.validateLongLatRange = validateLongLatRange;

function validateLongLatPoint(point) {
	if (!gjv.isGeoJSONObject(point)) {
		throw new XError(XError.INVALID_POINT, 'point of long-lat dimension is not a valid geojson object');
	}
	if (!gjv.isPoint(point)) {
		throw new XError(XError.INVALID_POINT, 'point of long-lat dimension is not a valid point');
	}
	return true;
}
exports.validateLongLatPoint = validateLongLatPoint;

function normalizeLongLatRange(range) {
	validateLongLatRange(range);
	let coordinates = range.coordinates;
	if (range.type === 'Polygon') coordinates = [ coordinates ];
	for (let polygonCoordinates of coordinates) {
		for (let linearRing of polygonCoordinates) {
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
	}
	return range;
}
exports.normalizeLongLatRange = normalizeLongLatRange;

function genTokensForLongLatPoint(point, steps) {
	let [ pointX, pointY ] = point.coordinates;
	let tokens = [];
	for (let step of steps) {
		let x = roundToFiveSignificantDigits(Math.floor(pointX / step) * step);
		let y = roundToFiveSignificantDigits(Math.floor(pointY / step) * step + step);
		tokens.push(`${x},${y}^${step}`);

		let x2, y2;
		if (pointX % step === 0) {
			x2 = roundToFiveSignificantDigits(Math.floor(pointX / step) * step - step);
			tokens.push(`${x2},${y}^${step}`);
		}
		if (pointY % step === 0) {
			y2 = roundToFiveSignificantDigits(Math.floor(pointY / step) * step);
			tokens.push(`${x},${y2}^${step}`);
			if (x2 !== undefined) { tokens.push(`${x2},${y2}^${step}`); }
		}
	}
	return tokens;
}
exports.genTokensForLongLatPoint = genTokensForLongLatPoint;

function validateDateRange(range) {
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
exports.validateDateRange = validateDateRange;

function validateDatePoint(point) {
	try {
		let date = new Date(point);
	} catch (ex) {
		throw new XError(XError.INVALID_POINT,
			'time point should be a timestamp or a date string or an instance of Date');
	}
	return true;
}
exports.validateDatePoint = validateDatePoint;

function isPointInsidePolygon(point, polygon) {
	let exterior = polygon.coordinates[0];
	let interiors = polygon.coordinates.slice(1);
	let state = geometry.pointLinearRingState(point, exterior);
	if (state === 'outside') return false;
	if (state === 'tangent') return true;
	for (let interior of interiors) {
		if (geometry.pointLinearRingState(point, interior) === 'inside') {
			return false;
		}
	}
	return true;
}
exports.isPointInsidePolygon = isPointInsidePolygon;
