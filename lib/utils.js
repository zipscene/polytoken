const gjv = require('geojson-validation');
const XError = require('xerror');

function roundToFiveSignificantDigits(number) {
	return ~~number === number ? number : Math.round(number * 100000) / 100000;
}
exports.roundToFiveSignificantDigits = roundToFiveSignificantDigits;

function validateLongLatRange(range) {
	// Range can be either a geojson object or a point/radius pair
	if (range.point && range.radius) {
		if (typeof range.radius !== 'number') {
			throw new XError(XError.INVALID_RANGE, 'range.radius must be numeric');
		}
		validateLongLatPoint(range.point);
	} else {
		if (!gjv.isGeoJSONObject(range)) {
			throw new XError(XError.INVALID_RANGE, 'range of long-lat dimension is not a valid geojson object');
		}
		if (!gjv.isPolygon(range) && !gjv.isMultiPolygon(range)) {
			throw new XError(
				XError.INVALID_RANGE,
				'range of long-lat dimension is not a valid Polygon or MultiPolygon'
			);
		}
	}
	return true;
}
exports.validateLongLatRange = validateLongLatRange;

function validateLongLatPoint(point) {
	// Accept either a full geoJSON point or longlat array
	if (Array.isArray(point)) {
		if (
			point.length === 2 &&
			typeof point[0] === 'number' && point[0] > -360 && point[0] < 360 &&
			typeof point[1] === 'number' && point[1] >= -90 && point[1] <= 90
		) {
			return true;
		}
	}
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
	if (range.point && range.radius) {
		// Normalize as point/range pair
		range.point = normalizeLongLatPoint(range.point);
	} else {
		// Normalize as polygon
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
	}
	return range;
}
exports.normalizeLongLatRange = normalizeLongLatRange;

function normalizeLongLatPoint(point) {
	validateLongLatPoint(point);
	if (Array.isArray(point)) {
		return { type: 'Point', coordinates: point };
	} else {
		return point;
	}
}
exports.normalizeLongLatPoint = normalizeLongLatPoint;


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
