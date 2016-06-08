const XError = require('xerror');

const INTERSECT = 'intersect';
const UNINTERSECT = '~intersect';
const TANGENT = 'tangent';
const INCLUDED = 'included';
const OVERLAP = 'overlap';

function getPointLineSegmentState([ x, y ], [ [ beginX, beginY ], [ endX, endY ] ]) {
	if (!isPointInLine([ x, y ], [ [ beginX, beginY ], [ endX, endY ] ])) {
		return 'outside';
	}
	if (beginX === endX) {
		if ((y - beginY) * (y - endY) < 0) {
			return 'inside';
		} else if ((y - beginY) * (y - endY) === 0) {
			return 'tangent';
		} else {
			return 'outside';
		}
	}
	if (beginY === endY) {
		if ((x - beginX) * (x - endX) < 0) {
			return 'inside';
		} else if ((x - beginX) * (x - endX) === 0) {
			return 'tangent';
		} else {
			return 'outside';
		}
	}
	if ((x - beginX) * (x - endX) < 0 && (y - beginY) * (y - endY) < 0) {
		return 'inside';
	} else if (x === beginX && y === beginY || (x === endX && y === endY)) {
		return 'tangent';
	} else {
		return 'outside';
	}
}
exports.getPointLineSegmentState = getPointLineSegmentState;

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
	} else if ((beginX - x) * (endY - y) === (endX - x) * (beginY - y)) {
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
 * @param {Number[]} line1Begin- {X, Y} coordianates of begin point of line1
 * @param {Number[]} line1End - {X, Y} coordianates of end point of line1
 * @param {Number[]} line2Begin - {X, Y} coordianates of begin point of line2
 * @param {Number[]} line2End - {X, Y} coordianates of end point of line2
 * @return {Number[]} - returns the {X,Y} coordianates of intersect point
 */
function getLineIntersect([ line1Begin, line1End ], [ line2Begin, line2End ]) {
	let [ x1Begin, y1Begin ] = line1Begin;
	let [ x1End, y1End ] = line1End;
	let [ x2Begin, y2Begin ] = line2Begin;
	let [ x2End, y2End ] = line2End;
	if ((x1Begin === x1End && y1Begin === y1End) || (x2Begin === x2End && y2Begin === y2End)) {
		throw new XError(XError.INVALID_ARGUMENT, 'start and end point of line must not be the same');
	}

	let slope1 = (y1Begin - y1End) / (x1Begin - x1End);
	let intercept1;
	if (x1Begin === x1End) {
		intercept1 = x1Begin;
	} else if (y1Begin === y1End) {
		intercept1 = y1Begin;
	} else {
		intercept1 = (y1Begin * x1End - y1End * x1Begin) / (x1End - x1Begin);
	}
	let slope2 = (y2Begin - y2End) / (x2Begin - x2End);
	let intercept2;
	if (x2Begin === x2End) {
		intercept2 = x2Begin;
	} else if (y2Begin === y2End) {
		intercept2 = y2Begin;
	} else {
		intercept2 = (y2Begin * x2End - y2End * x2Begin) / (x2End - x2Begin);
	}

	let intersectX, intersectY;

	if (slope1 === slope2 || (Math.abs(slope1) === Infinity && Math.abs(slope2) === Infinity)) {
		throw new XError(XError.INVALID_ARGUMENT, 'Can\'t get intersect of lines with the same slope');
	} else {
		if (Math.abs(slope1) === Infinity) {
			intersectX = x1Begin;
			intersectY = slope2 * x1Begin + intercept2;
		} else if (Math.abs(slope2) === Infinity) {
			intersectX = x2Begin;
			intersectY = slope1 * x2Begin + intercept1;
		} else if (slope1 === 0) {
			intersectY = y1Begin;
			intersectX = (intersectY - intercept2) / slope2;
		} else if (slope2 === 0) {
			intersectY = y2Begin;
			intersectX = (intersectY - intercept1) / slope1;
		} else {
			intersectX = (intercept2 - intercept1) / (slope1 - slope2);
			intersectY = ((slope1 * intercept2) - (slope2 * intercept1)) / (slope1 - slope2);
		}
	}

	return [ intersectX, intersectY ];
}
exports.getLineIntersect = getLineIntersect;

/**
 * Get the state of line segment line2 relative to line1. Available states are 'intersect',
 * '~intersect', 'included', 'overlap' and 'tangent'
 */
function getLineSegmentsIntersectState([ line1Begin, line1End ], [ line2Begin, line2End ]) {
	let [ x1Begin, y1Begin ] = line1Begin;
	let [ x1End, y1End ] = line1End;
	let [ x2Begin, y2Begin ] = line2Begin;
	let [ x2End, y2End ] = line2End;
	if ((x1Begin === x1End && y1Begin === y1End) || (x2Begin === x2End && y2Begin === y2End)) {
		throw new XError(XError.INVALID_ARGUMENT, 'start and end point of line must not be the same');
	}

	let slope1 = (y1Begin - y1End) / (x1Begin - x1End);
	let intercept1;
	if (x1Begin === x1End) {
		intercept1 = x1Begin;
	} else if (y1Begin === y1End) {
		intercept1 = y1Begin;
	} else {
		intercept1 = (y1Begin * x1End - y1End * x1Begin) / (x1End - x1Begin);
	}
	let slope2 = (y2Begin - y2End) / (x2Begin - x2End);
	let intercept2;
	if (x2Begin === x2End) {
		intercept2 = x2Begin;
	} else if (y2Begin === y2End) {
		intercept2 = y2Begin;
	} else {
		intercept2 = (y2Begin * x2End - y2End * x2Begin) / (x2End - x2Begin);
	}

	if (slope1 === slope2 || (Math.abs(slope1) === Infinity && Math.abs(slope2) === Infinity)) {
		if (intercept1 !== intercept2) {
			return '~intersect';
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) !== 'outside'
			&& getPointLineSegmentState(line2End, [ line1Begin, line1End ]) !== 'outside'
		) {
			return 'included';
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) === 'outside'
			&& getPointLineSegmentState(line2End, [ line1Begin, line1End ]) === 'outside'
		) {
			if ((line2Begin - line1Begin) * (line2End - line1Begin) > 0) {
				return '~intersect';
			} else {
				return 'overlap';
			}
		} else if (getPointLineSegmentState(line2Begin, [ line1Begin, line1End ]) === 'tangent'
			|| getPointLineSegmentState(line2End, [ line1Begin, line1End ]) === 'tangent'
		) {
			return 'tangent';
		} else {
			return 'overlap';
		}
	} else {
		let intersect = getLineIntersect([ line1Begin, line1End ], [ line2Begin, line2End ]);
		let line1State = getPointLineSegmentState(intersect, [ line1Begin, line1End ]);
		let line2State = getPointLineSegmentState(intersect, [ line2Begin, line2End ]);
		if (line1State === 'outside' || line2State === 'outside') return '~intersect';
		if (line1State === 'tangent' || line2State === 'tangent') return 'tangent';
		return 'intersect';
	}
}
exports.getLineSegmentsIntersectState = getLineSegmentsIntersectState;

function getLineSegmentMidPoint([ [ beginX, beginY ], [ endX, endY ] ], divider = 2) {
	let smallX = beginX <= endX ? beginX : endX;
	let largeX = beginX >= endX ? beginX : endX;
	let smallY = beginY <= endY ? beginY : endY;
	let largeY = beginY >= endY ? beginY : endY;
	if (beginX === endX) return [ smallX, smallY + (largeY - smallY) / divider ];
	if (beginY === endY) return [ smallX + (largeX - smallX) / divider, smallY ];
	let slope = (beginY - endY) / (beginX - endX);
	let intercept = (beginX * endY - endX * beginY) / (beginX - endX);
	let midPointX = smallX + (largeX - smallX) / divider;
	let midPointY = slope * midPointX + intercept;
	return [ midPointX, midPointY ];
}

function getRandPointInLineSegment([ [ beginX, beginY ], [ endX, endY ] ]) {
	let smallX = beginX <= endX ? beginX : endX;
	let largeX = beginX >= endX ? beginX : endX;
	let smallY = beginY <= endY ? beginY : endY;
	let largeY = beginY >= endY ? beginY : endY;
	if (beginY === endY) return [ smallX + Math.random() * (largeX - smallX), beginY ];
	if (beginX === endX) return [ beginX, smallY + Math.random() * (largeY - smallY) ];
	let slope = (beginY - endY) / (beginX - endX);
	let intercept = (beginX * endY - endX * beginY) / (beginX - endX);
	let randX = smallX + Math.random() * (largeX - smallX);
	let randY = slope * randX + intercept;
	return [ randX, randY ];
}
exports.getRandPointInLineSegment = getRandPointInLineSegment;

/**
 * Check if linearRing2 is inside linearRing1
 */
function getLinearRingsIntersectState(linearRing1, linearRing2) {
	for (let i = 0; i < linearRing1.length - 1; i++) {
		for (let j = 0; j < linearRing2.length - 1; j++) {
			let state = getLineSegmentsIntersectState(
				[ linearRing2[j], linearRing2[j + 1] ], [ linearRing1[i], linearRing1[i + 1] ]);
			// the two linearRings intersect with each other
			if (state === 'intersect') {
				return 'intersect';
			}
		}
	}
	let foundOutside = false, foundInside = false, level = 0;
	// only search three levels
	// while (level <= 3) {
	// 	for (let i = 0; i < linearRing2.length - 1; i++) {
	// 		let midPoint = level === 0
	// 			? linearRing2[i]
	// 			: getLineSegmentMidPoint([ linearRing2[i], linearRing2[i + 1] ], Math.pow(10, level));
	// 		let state = pointLinearRingState(midPoint, linearRing1);
	// 		if (state === 'outside') {
	// 			foundOutside = true;
	// 		} else if (state === 'inside') {
	// 			foundInside = true;
	// 		}
	// 		if (foundInside && foundInside) break;
	// 	}
	// 	if (foundInside && foundOutside) break;
	// 	level++;
	// }
	for (let i = 0; i < linearRing2.length - 1; i++) {
		for (let j = 0; j < 200; j++) {
			let randPoint = getRandPointInLineSegment([ linearRing2[i], linearRing2[i + 1] ]);
			let state = pointLinearRingState(randPoint, linearRing1);
			if (state === 'outside') {
				foundOutside = true;
			} else if (state === 'inside') {
				foundInside = true;
			}
			if (foundInside && foundInside) break;
		}
	}
	// The two linear rings are identical if all points of three levels are on the edges of linearRing1.
	// We mark identical linear ring as 'inside'
	if (!foundOutside && !foundInside) return 'inside';
	if (foundOutside && foundInside) return 'intersect';
	if (foundInside) return 'inside';
	return 'outside';
}
exports.getLinearRingsIntersectState = getLinearRingsIntersectState;

/**
 * @param {Number[]} point - begin point of the ray
 */
function getRayLineSegmentIntersectState([ point, point2 ], [ lineBegin, lineEnd ]) {
	let [ x, y ] = point;
	let [ x2, y2 ] = point2;
	let [ beginX, beginY ] = lineBegin;
	let [ endX, endY ] = lineEnd;
	let raySlope = (y2 - y) / (x2 - x);
	let lineSlope = (endY - beginY) / (endX - beginX);
	if (isPointInLine(point, [ lineBegin, lineEnd ]) && isPointInLine(point2, [ lineBegin, lineEnd ])) {
		if (((x - x2) * (x - beginX) < 0 && (x - x2 * (x - endX) < 0))
			|| ((y - y2) * (y - beginY) < 0 && (y - y2 * (y - endY) < 0))
		) {
			return '~intersect';
		} else {
			return 'overlap';
		}
	} else if (raySlope === lineSlope) {
		return '~intersect';
	} else {
		let intersect = getLineIntersect([ point, point2 ], [ lineBegin, lineEnd ]);
		let [ intersectX, intersectY ] = intersect;
		if (intersectX < x) return '~intersect';
		if ((intersectX - beginX) * (intersectX - endX) < 0 || (intersectY - beginY) * (intersectY - endY) < 0) {
			return 'intersect';
		} else if ((intersectX - beginX) * (intersectX - endX) > 0 || (intersectY - beginX) * (intersectY - endY) > 0) {
			return '~intersect';
		} else {
			return 'tangent';
		}
	}
}
exports.getRayLineSegmentIntersectState = getRayLineSegmentIntersectState;

function pointLinearRingState(point, linearRing) {
	let { topLeftVertex, width, height } = getBoundingBox(linearRing);
	let [ minX, maxY ] = topLeftVertex;
	let maxX = minX + width;
	let minY = maxY - height;
	let [ x, y ] = point;
	if (x < minX || x > maxX || y < minY || y > maxY) return 'outside';
	for (let i = 0; i < linearRing.length - 1; i++) {
		if (isPointInLine(point, [ linearRing[i], linearRing[i + 1] ])) {
			if (getPointLineSegmentState(point, [ linearRing[i], linearRing[i + 1] ])) {
				return 'tangent';
			}
		}
	}
	let numIntersect = 0;
	let slope = 0;
	let determinedState = false;
	while (!determinedState) {
		let state;
		let intercept = point[1] - slope * point[0];
		let point2 = [ point[0] + 1, slope * (point[0] + 1) + intercept ];
		for (let i = 0; i < linearRing.length - 1; i++) {
			state = getRayLineSegmentIntersectState([ point, point2 ], [ linearRing[i], linearRing[i + 1] ]);
			if (state === 'tangent' || state === 'overlap') {
				break;
			} else if (state === 'intersect') {
				numIntersect++;
			}
		}
		if (state === 'intersect' || state === '~intersect') {
			determinedState = true;
		} else {
			numIntersect = 0;
			slope += 0.001;
		}
	}
	return numIntersect % 2 === 1 ? 'inside' : 'outside';
}
exports.pointLinearRingState = pointLinearRingState;

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

function squareLinearRingIntersectState(linearRing, topLeftVertex, squareSize) {
	let [ topLeftX, topLeftY ] = topLeftVertex;
	let topRightVertex = [ topLeftX + squareSize, topLeftY ];
	let bottomRightVertex = [ topLeftX + squareSize, topLeftY - squareSize ];
	let bottomLeftVertex = [ topLeftX, topLeftY - squareSize ];
	let squareLinearRing = [ topLeftVertex, topRightVertex, bottomRightVertex, bottomLeftVertex, topLeftVertex ];
	return getLinearRingsIntersectState(linearRing, squareLinearRing);
}
exports.squareLinearRingIntersectState = squareLinearRingIntersectState;
