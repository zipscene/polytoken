const XError = require('xerror');
const { roundToFiveSignificantDigits, validateLongLatRange } = require('./utils');

const INTERSECT = 'intersect';
const UNINTERSECT = '~intersect';
const TANGENT = 'tangent';
const INCLUDED = 'included';
const OVERLAP = 'overlap';
const INSIDE = 'inside';
const OUTSIDE = 'outside';


// VECTOR MATHS
// In all cases, arguments to these functions are arrays of length 2.
function vectorAdd(a, b) {
	return [ a[0] + b[0], a[1] + b[1] ];
}

function vectorSubtract(a, b) {
	return [ a[0] - b[0], a[1] - b[1] ];
}

// Magnitude of cross product
function vectorCross(a, b) {
	return a[1] * b[0] - a[0] * b[1];
}

// Vector dot product
function vectorDot(a, b) {
	return a[0] * b[0] + a[1] * b[1];
}

/**
 * Get the state of a point in relationship to a line segment
 *
 * @method getPointLineSegmentState
 * @param {Number[]} [ x, y ] - coordinates of the point
 * @param {Number[][]} [ [ beginX, beginY ], [ endX, endY ] ] - coordinates of begin and end points of the line segment
 * @return {String} - return the state of the point. Can only be one of: 'inside', 'outside' and 'tangent'
 */
function getPointLineSegmentState([ x, y ], [ [ beginX, beginY ], [ endX, endY ] ]) {
	if (!isPointInLine([ x, y ], [ [ beginX, beginY ], [ endX, endY ] ])) {
		return OUTSIDE;
	}
	if (beginX === endX) {
		if (roundToFiveSignificantDigits((y - beginY) * (y - endY)) < 0) {
			return INSIDE;
		} else if (roundToFiveSignificantDigits((y - beginY) * (y - endY)) === 0) {
			return TANGENT;
		} else {
			return OUTSIDE;
		}
	}
	if (beginY === endY) {
		if (roundToFiveSignificantDigits((x - beginX) * (x - endX)) < 0) {
			return INSIDE;
		} else if (roundToFiveSignificantDigits((x - beginX) * (x - endX)) === 0) {
			return TANGENT;
		} else {
			return OUTSIDE;
		}
	}
	if (roundToFiveSignificantDigits((x - beginX) * (x - endX)) < 0
		&& roundToFiveSignificantDigits((y - beginY) * (y - endY)) < 0) {
		return INSIDE;
	} else if (x === beginX && y === beginY || (x === endX && y === endY)) {
		return TANGENT;
	} else {
		return OUTSIDE;
	}
}
exports.getPointLineSegmentState = getPointLineSegmentState;

/**
 * Check if the given point is in a given line (Note not a line segment)
 *
 * @method isPointInLine
 * @param {Number[]} point - coordinates of the point
 * @param {Number[][]} [ lineBegin, lineEnd ] - coordinates of two points in the line
 * @return {Boolean} - return true if the point is in line. Otherwise false.
 */
function isPointInLine(point, [ lineBegin, lineEnd ]) {
	let [ x, y ] = point;
	let [ beginX, beginY ] = lineBegin;
	let [ endX, endY ] = lineEnd;
	if (x === beginX && y === beginY || (x === endX && y === endY)) {
		return true;
	} else if (beginX === endX) {
		return x === beginX;
	} else if (beginY === endY) {
		return y === beginY;
	} else if (roundToFiveSignificantDigits((beginX - x) * (endY - y))
		=== roundToFiveSignificantDigits((endX - x) * (beginY - y))) {
		return true;
	} else {
		return false;
	}
}
exports.isPointInLine = isPointInLine;

/**
 * Get the intersect point of two lines
 *
 * @method getLineIntersect
 * @param {Number[]} line1Begin - coordianates of first point in line1
 * @param {Number[]} line1End - coordianates of second point of line1
 * @param {Number[]} line2Begin - coordianates of first point in line2
 * @param {Number[]} line2End -  coordianates of second point of line2
 * @return {Number[]} - returns the coordianates of intersect point
 */
function getLineIntersect([ line1Begin, line1End ], [ line2Begin, line2End ]) {
	let [ x1Begin, y1Begin ] = line1Begin;
	let [ x1End, y1End ] = line1End;
	let [ x2Begin, y2Begin ] = line2Begin;
	let [ x2End, y2End ] = line2End;
	if ((x1Begin === x1End && y1Begin === y1End) || (x2Begin === x2End && y2Begin === y2End)) {
		throw new XError(XError.INVALID_ARGUMENT, 'start and end point of line must not be the same');
	}

	let slope1 = roundToFiveSignificantDigits((y1Begin - y1End) / (x1Begin - x1End));
	let intercept1;
	if (x1Begin === x1End) {
		intercept1 = x1Begin;
	} else if (y1Begin === y1End) {
		intercept1 = y1Begin;
	} else {
		intercept1 = roundToFiveSignificantDigits((y1Begin * x1End - y1End * x1Begin) / (x1End - x1Begin));
	}
	let slope2 = roundToFiveSignificantDigits((y2Begin - y2End) / (x2Begin - x2End));
	let intercept2;
	if (x2Begin === x2End) {
		intercept2 = x2Begin;
	} else if (y2Begin === y2End) {
		intercept2 = y2Begin;
	} else {
		intercept2 = roundToFiveSignificantDigits((y2Begin * x2End - y2End * x2Begin) / (x2End - x2Begin));
	}

	let intersectX, intersectY;

	if (slope1 === slope2 || (Math.abs(slope1) === Infinity && Math.abs(slope2) === Infinity)) {
		throw new XError(XError.INVALID_ARGUMENT, 'Can\'t get intersect of lines with the same slope');
	} else {
		if (Math.abs(slope1) === Infinity) {
			intersectX = x1Begin;
			intersectY = roundToFiveSignificantDigits(slope2 * x1Begin + intercept2);
		} else if (Math.abs(slope2) === Infinity) {
			intersectX = x2Begin;
			intersectY = roundToFiveSignificantDigits(slope1 * x2Begin + intercept1);
		} else if (slope1 === 0) {
			intersectY = y1Begin;
			intersectX = roundToFiveSignificantDigits((intersectY - intercept2) / slope2);
		} else if (slope2 === 0) {
			intersectY = y2Begin;
			intersectX = roundToFiveSignificantDigits((intersectY - intercept1) / slope1);
		} else {
			intersectX = roundToFiveSignificantDigits((intercept2 - intercept1) / (slope1 - slope2));
			intersectY = roundToFiveSignificantDigits(((slope1 * intercept2)
				- (slope2 * intercept1)) / (slope1 - slope2));
		}
	}

	return [ intersectX, intersectY ];
}
exports.getLineIntersect = getLineIntersect;

/**
 * Get the state of line segment line2 relative to line segment line1. Available states are INTERSECT,
 * UNINTERSECT, INCLUDED, OVERLAP and TANGENT
 *
 * @getLineSegmentsIntersectState
 * @param {Number[][]} - coordinates of begin and end of line segment line1
 * @param {Number[][]} - coordinates of begin and end of line segment line2
 * @return {String} - return the state. Can only be one of: 'intersect', '~intersect', 'included', 'overlap'
 * and 'tangent'
 */
function getLineSegmentsIntersectState([ line1Begin, line1End ], [ line2Begin, line2End ]) {
	let [ x1Begin, y1Begin ] = line1Begin;
	let [ x1End, y1End ] = line1End;
	let [ x2Begin, y2Begin ] = line2Begin;
	let [ x2End, y2End ] = line2End;
	if ((x1Begin === x1End && y1Begin === y1End) || (x2Begin === x2End && y2Begin === y2End)) {
		throw new XError(XError.INVALID_ARGUMENT, 'start and end point of line must not be the same');
	}

	let slope1 = roundToFiveSignificantDigits((y1Begin - y1End) / (x1Begin - x1End));
	let intercept1;
	if (x1Begin === x1End) {
		intercept1 = x1Begin;
	} else if (y1Begin === y1End) {
		intercept1 = y1Begin;
	} else {
		intercept1 = roundToFiveSignificantDigits((y1Begin * x1End - y1End * x1Begin) / (x1End - x1Begin));
	}
	let slope2 = roundToFiveSignificantDigits((y2Begin - y2End) / (x2Begin - x2End));
	let intercept2;
	if (x2Begin === x2End) {
		intercept2 = x2Begin;
	} else if (y2Begin === y2End) {
		intercept2 = y2Begin;
	} else {
		intercept2 = roundToFiveSignificantDigits((y2Begin * x2End - y2End * x2Begin) / (x2End - x2Begin));
	}

	if (slope1 === slope2 || (Math.abs(slope1) === Infinity && Math.abs(slope2) === Infinity)) {
		if (intercept1 !== intercept2) {
			return UNINTERSECT;
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) !== OUTSIDE
			&& getPointLineSegmentState(line2End, [ line1Begin, line1End ]) !== OUTSIDE
		) {
			return INCLUDED;
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) === OUTSIDE
			&& getPointLineSegmentState(line2End, [ line1Begin, line1End ]) === OUTSIDE
		) {
			if ((line2Begin - line1Begin) * (line2End - line1Begin) > 0) {
				return UNINTERSECT;
			} else {
				return OVERLAP;
			}
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) === TANGENT
			|| getPointLineSegmentState(line2End, [ line1Begin, line1End ]) === TANGENT
		) {
			return TANGENT;
		} else {
			return OVERLAP;
		}
	} else {
		let intersect = getLineIntersect([ line1Begin, line1End ], [ line2Begin, line2End ]);
		let line1State = getPointLineSegmentState(intersect, [ line1Begin, line1End ]);
		let line2State = getPointLineSegmentState(intersect, [ line2Begin, line2End ]);
		if (line1State === OUTSIDE || line2State === OUTSIDE) return UNINTERSECT;
		if (line1State === TANGENT || line2State === TANGENT) return TANGENT;
		return INTERSECT;
	}
}
exports.getLineSegmentsIntersectState = getLineSegmentsIntersectState;

/**
 * Get a random point in given line segment
 *
 * @method getRandPointInLineSegment
 * @param {Number[][]} - coordinates of begin and end points of the line segment
 * @return {Number[]} - coordinates of generated random point
 */
function getRandPointInLineSegment([ [ beginX, beginY ], [ endX, endY ] ]) {
	let smallX = beginX <= endX ? beginX : endX;
	let largeX = beginX >= endX ? beginX : endX;
	let smallY = beginY <= endY ? beginY : endY;
	let largeY = beginY >= endY ? beginY : endY;
	if (beginY === endY) return [ roundToFiveSignificantDigits(smallX + Math.random() * (largeX - smallX)), beginY ];
	if (beginX === endX) return [ beginX, roundToFiveSignificantDigits(smallY + Math.random() * (largeY - smallY)) ];
	let slope = roundToFiveSignificantDigits((beginY - endY) / (beginX - endX));
	let intercept = roundToFiveSignificantDigits((beginX * endY - endX * beginY) / (beginX - endX));
	let randX = roundToFiveSignificantDigits(smallX + Math.random() * (largeX - smallX));
	let randY = roundToFiveSignificantDigits(slope * randX + intercept);
	return [ randX, randY ];
}
exports.getRandPointInLineSegment = getRandPointInLineSegment;

/**
 * Get the state of lienarRing2 in relationship to linearRing1
 *
 * @method getLinearRingsIntersectState
 * @param {Number[][]} - coordinates of linearRing1
 * @param {Number\[][]} - coordinates of linearRing2
 * @return {String} - return the state. It can only be one of: 'intersect', 'outside'
 * and 'inside'
 */
function getLinearRingsIntersectState(linearRing1, linearRing2) {
	let isLinearRingsTouching = false;
	for (let i = 0; i < linearRing1.length - 1; i++) {
		for (let j = 0; j < linearRing2.length - 1; j++) {
			let state = getLineSegmentsIntersectState(
				[ linearRing2[j], linearRing2[j + 1] ], [ linearRing1[i], linearRing1[i + 1] ]);
			// the two linearRings intersect with each other
			if (state === INTERSECT) {
				return INTERSECT;
			}
			if (state !== UNINTERSECT) {
				isLinearRingsTouching = true;
			}
		}
	}
	if (!isLinearRingsTouching) {
		let foundOutside = false, foundInside = false;
		for (let i = 0; i < linearRing2.length - 1; i++) {
			let state = pointLinearRingState(linearRing2[i], linearRing1);
			if (state === OUTSIDE) {
				foundOutside = true;
			} else if (state === INSIDE) {
				foundInside = true;
			}
			if (foundInside && foundOutside) break;
		}
		if (foundOutside && foundInside) {
			return INTERSECT;
		} else if (foundInside) {
			return INSIDE;
		} else {
			return OUTSIDE;
		}
	} else {
		let foundOutside = false, foundInside = false;
		for (let i = 0; i < linearRing2.length - 1; i++) {
			for (let j = 0; j < 250; j++) {
				let randPoint = getRandPointInLineSegment([ linearRing2[i], linearRing2[i + 1] ]);
				let state = pointLinearRingState(randPoint, linearRing1);
				if (state === OUTSIDE) {
					foundOutside = true;
				} else if (state === INSIDE) {
					foundInside = true;
				}
				if (foundInside && foundInside) break;
			}
		}
		// The two linear rings are identical if all points of three levels are on the edges of linearRing1.
		// We mark identical linear ring as INSIDE
		if (!foundOutside && !foundInside) return INSIDE;
		if (foundOutside && foundInside) return INTERSECT;
		if (foundInside) return INSIDE;
		return OUTSIDE;
	}
}
exports.getLinearRingsIntersectState = getLinearRingsIntersectState;

/**
 * get the state of ray in relationship to a line segment
 *
 * @method getRayLineSegmentIntersectState
 * @param {Number[][]} [ point, point2 ] - `point` is the begin point of the ray. `point2` is a point in ray
 * @param {Number[][]} [ lineBegin, lineEnd ] - coordinates of begin and end point of line segment
 * @return {String} - return the state string. Can only be one of: '~intersect', 'intersect', 'overlap' and 'tangent'
 */
function getRayLineSegmentIntersectState([ rayOrigin, rayPoint ], [ lineBegin, lineEnd ]) {
	// Find unit deviations for ray and point
	let dRay = vectorSubtract(rayPoint, rayOrigin);
	let dLine = vectorSubtract(lineEnd, lineBegin);

	if (vectorCross(dRay, dLine) === 0) {
		if (vectorCross(vectorSubtract(lineBegin, rayOrigin), dRay) === 0) {
			// Lines are parallel and collinear
			// Find out if any part of the ray intersects with the line segment
			let t1 = vectorDot(vectorSubtract(lineEnd, rayOrigin), dRay) / vectorDot(dRay, dRay);
			if (t1 >= 0) {
				return OVERLAP;
			} else {
				return UNINTERSECT;
			}
		} else {
			// Lines are parallel and not collinear
			return UNINTERSECT;
		}
	} else {
		// Find solution to parametrized line intersect equations
		let tRay = vectorCross(vectorSubtract(lineBegin, rayOrigin), dLine) / vectorCross(dRay, dLine);
		let tLine = vectorCross(vectorSubtract(rayOrigin, lineBegin), dRay) / vectorCross(dLine, dRay);
		if (tRay > 0 && tLine > 0 && tLine < 1) {
			return INTERSECT;
		} else if (tRay > 0 && (tLine === 0 || tLine === 1)) {
			// Intersects at an endpoint of the line
			return TANGENT;
		} else {
			return UNINTERSECT;
		}
	}
}
exports.getRayLineSegmentIntersectState = getRayLineSegmentIntersectState;

/**
 * Get the state of point in relationship to a linear ring
 *
 * @method pointLinearRingState
 * @param {Number[]} point - coordinates of the point
 * @param {Number[][]} - linearRing - coordinates of vertexes of the linear ring
 * @return {String} - return the state. Can only be one of: 'outside', 'inside'
 * and 'tangent'
 */
function pointLinearRingState(point, linearRing) {
	let { topLeftVertex, width, height } = getBoundingBox(linearRing);
	let [ minX, maxY ] = topLeftVertex;
	let maxX = minX + width;
	let minY = maxY - height;
	let [ x, y ] = point;
	if (x < minX || x > maxX || y < minY || y > maxY) return OUTSIDE;
	for (let i = 0; i < linearRing.length - 1; i++) {
		if (isPointInLine(point, [ linearRing[i], linearRing[i + 1] ])) {
			if (getPointLineSegmentState(point, [ linearRing[i], linearRing[i + 1] ])) {
				return TANGENT;
			}
		}
	}
	let numIntersect = 0;
	let slope = 0;
	let determinedState = false;
	while (!determinedState) {
		let state;
		let intercept = roundToFiveSignificantDigits(point[1] - slope * point[0]);
		let point2 = [ roundToFiveSignificantDigits(point[0] + 1),
			roundToFiveSignificantDigits(slope * (point[0] + 1) + intercept) ];
		for (let i = 0; i < linearRing.length - 1; i++) {
			state = getRayLineSegmentIntersectState([ point, point2 ], [ linearRing[i], linearRing[i + 1] ]);
			if (state === TANGENT || state === OVERLAP) {
				break;
			} else if (state === INTERSECT) {
				numIntersect++;
			}
		}
		if (state === INTERSECT || state === UNINTERSECT) {
			determinedState = true;
		} else {
			numIntersect = 0;
			slope += 0.01;
		}
	}
	return numIntersect % 2 === 1 ? INSIDE : OUTSIDE;
}
exports.pointLinearRingState = pointLinearRingState;

/**
 * Get the bounding box of given linear ring
 *
 * @method getBoundingBox
 * @param {Number[][]} linearRing - coordinates of vertexes of the linear ring
 * @return {Object} - return an object like this: { topLeftVertex: [ 2, 3 ], width: 1, height: 2 },
 * where `topLeftVertex` is the top left vertex of the bounding box
 */
function getBoundingBox(linearRing) {
	if (!Array.isArray(linearRing)) {
		throw new XError(XError.INVALID_ARGUMENT, 'linearRing must be an array');
	}
	let leftX = Infinity;
	let rightX = -Infinity;
	let bottomY = Infinity;
	let topY = -Infinity;

	for (let point of linearRing) {
		if (!Array.isArray(point) || point.length !== 2 || point.some((coord) => typeof coord !== 'number')) {
			throw new XError(XError.INVALID_ARGUMENT, 'invalid point in linear ring');
		}
		let [ x, y ] = point;
		if (x < leftX) leftX = x;
		if (x > rightX) rightX = x;
		if (y < bottomY) bottomY = y;
		if (y > topY) topY = y;
	}
	return {
		topLeftVertex: [ leftX, topY ],
		width: rightX - leftX,
		height: topY - bottomY
	};
}
exports.getBoundingBox = getBoundingBox;

/**
 * Get the state of a square linear ring in relationship to another linear ring
 *
 * @method squareLinearRingIntersectState
 * @param {Numner[][]} linearRing - coordinates of the linear ring
 * @param {Number[]} topLeftVertex - coordinates of the top left vertx of the square
 * @param {Number} squareSize - size of edge of the square
 * @return {String} - return the state. it should share the same set of values with the
 * the return value of `getLinearRingsIntersectState`
 */
function squareLinearRingIntersectState(linearRing, topLeftVertex, squareSize) {
	let [ topLeftX, topLeftY ] = topLeftVertex;
	let topRightVertex = [ topLeftX + squareSize, topLeftY ];
	let bottomRightVertex = [ topLeftX + squareSize, topLeftY - squareSize ];
	let bottomLeftVertex = [ topLeftX, topLeftY - squareSize ];
	let squareLinearRing = [ topLeftVertex, topRightVertex, bottomRightVertex, bottomLeftVertex, topLeftVertex ];
	return getLinearRingsIntersectState(linearRing, squareLinearRing);
}
exports.squareLinearRingIntersectState = squareLinearRingIntersectState;

function isPointInsidePolygon(point, range) {
	validateLongLatRange(range);
	let coordinateSet = range.type === 'MultiPolygon' ? range.coordinates : [ range.coordinates ];
	for (let coordinates of coordinateSet) {
		let exterior = coordinates[0];
		let interiors = coordinates.slice(1);
		let state = pointLinearRingState(point, exterior);
		if (state === 'tangent') return true;
		if (state === 'inside') {
			let insideInterior = false;
			for (let interior of interiors) {
				if (pointLinearRingState(point, interior) === 'inside') {
					insideInterior = true;
					break;
				}
			}
			if (!insideInterior) return true;
		}
	}
	return false;
}
exports.isPointInsidePolygon = isPointInsidePolygon;


function genRangeTokensForPolygon(coordinates, steps, tokenSet) {
	let { topLeftVertex, width, height } = getBoundingBox(coordinates[0]);
	let maxEdgeLength = width > height ? width : height;
	let step;
	for (let i = steps.length - 1; i >= 0; i--) {
		if (steps[i] >= maxEdgeLength) {
			step = steps[i];
			break;
		}
	}
	if (!step) step = steps[0];
	let [ x, y ] = topLeftVertex;
	let topLeftX = x;
	let topLeftY = y;
	if (x % step) {
		x = roundToFiveSignificantDigits(x >= 0 ? x - x % step : x - (step + x % step));
	}
	if (y % step) {
		y = roundToFiveSignificantDigits(y >= 0 ? y + (step - y % step) : y - (y % step));
	}
	for (let currentX = x; currentX < topLeftX + width; currentX += step) {
		for (let currentY = y; currentY > topLeftY - height; currentY -= step) {
			let roundedX = roundToFiveSignificantDigits(currentX);
			let roundedY = roundToFiveSignificantDigits(currentY);
			if (currentX >= -180 && currentX <= 180) {
				tokenSet[`${roundedX},${roundedY}^${step}`] = true;
			} else if (currentX < -180) {
				tokenSet[`${360 + roundedX},${roundedY}^${step}`] = true;
			} else {
				tokenSet[`${roundedX - 360},${roundedY}^${step}`] = true;
			}
		}
	}
	return tokenSet;
}
exports.genRangeTokensForPolygon = genRangeTokensForPolygon;
