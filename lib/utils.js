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
	if (!gjv.isPolygon(range)) {
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
	for (let linearRing of range.coordinates) {
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
	return range;
}
exports.normalizeLongLatRange = normalizeLongLatRange;

function genTokensForLongLatPoint(point, steps) {
	let [ pointX, pointY ] = point.coordinates;
	// let complementPointX = 0;
	// complementPointX = pointX > 0 ? pointX - 360 : pointX + 360;
	let tokens = [];
	for (let step of steps) {
		let x = roundToFiveSignificantDigits(Math.floor(pointX / step) * step);
		let y = roundToFiveSignificantDigits(Math.floor(pointY / step) * step + step);
		tokens.push(`${x},${y}^${step}`);

		// Also generate tokens for complement x coordinate of the point. For example,
		// if the point's coordinates are [ 178, 2 ], then the complement coordinates are
		// [ -182, 2 ]. This is necessary to match up polygons go across meridian
		// let complementX = Math.floor(complementPointX / step) * step;
		// tokens.push(`${complementX},${y}^${step}`);
		//
		let x2, y2, complementX2;
		if (pointX % step === 0) {
			x2 = roundToFiveSignificantDigits(Math.floor(pointX / step) * step - step);
			tokens.push(`${x2},${y}^${step}`);
		}
		// if (complementPointX % step === 0) {
		// 	complementX2 = Math.floor(complementX / step) * step - step;
		// 	tokens.push(`${complementX2},${y}^${step}`);
		// }
		if (pointY % step === 0) {
			y2 = roundToFiveSignificantDigits(Math.floor(pointY / step) * step);
			tokens.push(`${x},${y2}^${step}`);
			// tokens.push(`${complementX},${y2}^${step}`);
			if (x2 !== undefined) { tokens.push(`${x2},${y2}^${step}`); }
			// if (complementX2 !== undefined) { tokens.push(`${complementX2},${y2}^${step}`); }
		}
	}
	return tokens;
}
exports.genTokensForLongLatPoint = genTokensForLongLatPoint;

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
