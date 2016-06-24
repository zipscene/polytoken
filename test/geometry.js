const { expect } = require('chai');
const geometry = require('../lib/geometry');

describe('geometry', function() {
	describe('#isPointInLine', function() {
		it('should return true for point on this line', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 3, 3 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;

			line = [ [ 0, 0 ], [ 0, 1 ] ];
			point = [ 0, -3 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;

			line = [ [ 1, 0 ], [ 100, 0 ] ];
			point = [ 4000.05, 0 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;

			line = [ [ 1, 3 ], [ 3, 5 ] ];
			point = [ -1, 1 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;
		});

		it('should return false for point not on this line', function() {
			let line  = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 1, 2 ];
			expect(geometry.isPointInLine(point, line)).to.be.false;

			line = [ [ 1, 1 ], [ 2, 2 ] ];
			point = [ 3, 4 ];
			expect(geometry.isPointInLine(point, line)).to.be.false;
		});

		it('should return true for point which is one of the line points', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 1, 1 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;
			point = [ 2, 2 ];
			expect(geometry.isPointInLine(point, line)).to.be.true;
		});
	});

	describe('#getPointLineSegmentState', function() {
		it('should return \'outside\' when point isn\'t in line', function functionName() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 1, 3 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');

			line = [ [ 0, 1 ], [ 0, 2 ] ];
			point = [ 2, 3 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');

			line = [ [ 1, 0 ], [ 2, 0 ] ];
			point = [ 3, 3 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');
		});

		it('should return \'outside\' when point is in line but not in line segment', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 3, 3 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');

			line = [ [ 1, 2 ], [ 2, 2 ] ];
			point = [ 3, 2 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');

			line = [ [ 3, 1 ], [ 3, 2 ] ];
			point = [ 3, 3 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('outside');
		});

		it('should return \'inside\' when point is in line segment', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 1.5, 1.5 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('inside');

			line = [ [ 1, 2 ], [ 2, 2 ] ];
			point = [ 1.5, 2 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('inside');

			line = [ [ 3, 1 ], [ 3, 2 ] ];
			point = [ 3, 1.5 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('inside');
		});

		it('should return \'tangent\' when point is one of the line endpoint', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let point = [ 1, 1 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('tangent');

			line = [ [ 1, 1 ], [ 2, 1 ] ];
			point = [ 2, 1 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('tangent');

			line = [ [ 1, 1 ], [ 1, 2 ] ];
			point = [ 1, 2 ];
			expect(geometry.getPointLineSegmentState(point, line)).to.equal('tangent');
		});
	});

	describe('#getLineIntersect', function() {
		it('should return the intersect point of two lines that intersect', function() {
			let line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			let line2 = [ [ -1, 1 ], [ -2, 2 ] ];
			let intersect = geometry.getLineIntersect(line1, line2);
			expect(intersect).to.exist;
			expect(intersect).to.be.an('array');
			expect(intersect).to.have.length(2);
			expect(intersect[0]).to.equal(0);
			expect(intersect[1]).to.equal(0);
		});

		it('should throw error of two lines that are parallal', function() {
			let line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			let line2 = [ [ 1, 2 ], [ 2, 4 ] ];
			try {
				let intersect = geometry.getLineIntersect(line1, line2);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_argument');
				expect(ex).to.have.property('message', 'Can\'t get intersect of lines with the same slope');
			}
		});

		it('should throw error when two lines that are the same line', function() {
			let line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			let line2 = [ [ 3, 3 ], [ 4, 4 ] ];
			try {
				let intersect = geometry.getLineIntersect(line1, line2);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_argument');
				expect(ex).to.have.property('message', 'Can\'t get intersect of lines with the same slope');
			}
		});
	});

	describe('#getLineSegmentsIntersectState', function() {
		it('should return \'~intersect\' for two parallal line segments', function() {
			let line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			let line2 = [ [ 1, 3 ], [ 2, 4 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('~intersect');

			line1 = [ [ 0, 1 ], [ 0, 2 ] ];
			line2 = [ [ 1, 1 ], [ 1, 2 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('~intersect');

			line1 = [ [ 1, 0 ], [ 2, 0 ] ];
			line2 = [ [ 1, 1 ], [ 2, 1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('~intersect');
		});

		it('should return \'included\' if line2 is part of line1', function() {
			let line1 = [ [ 1, 1 ], [ 4, 4 ] ];
			let line2 = [ [ 2, 2 ], [ 3, 3 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('included');

			line1 = [ [ 1, 1 ], [ 1, 4 ] ];
			line2 = [ [ 1, 2 ], [ 1, 3 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('included');

			line1 = [ [ 1, 1 ], [ 4, 1 ] ];
			line2 = [ [ 2, 1 ], [ 3, 1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('included');
		});

		it('should \'overlap\' if part of line1 and line2 overlaps or line2 includes line1', function() {
			let line1 = [ [ 1, 1 ], [ 3, 3 ] ];
			let line2 = [ [ 2, 2 ], [ 4, 4 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');

			line1 = [ [ 2, 2 ], [ 3, 3 ] ];
			line2 = [ [ 1, 1 ], [ 4, 4 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');

			line1 = [ [ 1, 1 ], [ 1, 3 ] ];
			line2 = [ [ 1, 2 ], [ 1, 4 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');

			line1 = [ [ 1, 2 ], [ 1, 3 ] ];
			line2 = [ [ 1, 1 ], [ 1, 4 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');

			line1 = [ [ 1, 1 ], [ 3, 1 ] ];
			line2 = [ [ 2, 1 ], [ 4, 1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');

			line1 = [ [ 2, 1 ], [ 3, 1 ] ];
			line2 = [ [ 4, 1 ], [ 1, 1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('overlap');
		});

		it('should return \'tangent\' iff the intersect is one of the lines endpoint', function() {
			let line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			let line2 = [ [ 3, 3 ], [ 2, 2 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('tangent');

			line1 = [ [ 0, 1 ], [ 0, 2 ] ];
			line2 = [ [ 0, 1 ], [ 0, -1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('tangent');

			line1 = [ [ 1, 0 ], [ 2, 0 ] ];
			line2 = [ [ 2, 0 ], [ 3, 0 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('tangent');

			line1 = [ [ 1, 1 ], [ 2, 2 ] ];
			line2 = [ [ 0, 2 ], [ 2, 0 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('tangent');

			line1 = [ [ 0, 2 ], [ 2, 0 ] ];
			line2 = [ [ 2, 2 ], [ 1, 1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('tangent');
		});

		it('should return \'intersect\' if the intersect lies in both line segments', function() {
			let line1 = [ [ 1, 1 ], [ -1, -1 ] ];
			let line2 = [ [ -1, 1 ], [ 1, -1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('intersect');

			line1 = [ [ 0, 1 ], [ 0, 3 ] ];
			line2 = [ [ 1, 1 ], [ -1, 3 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('intersect');

			line1 = [ [ 1, 0 ], [ -1, 0 ] ];
			line2 = [ [ 1, 1 ], [ -1, -1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('intersect');

			line1 = [ [ 1, 0 ], [ -1, 0 ] ];
			line2 = [ [ 0, 1 ], [ 0, -1 ] ];
			expect(geometry.getLineSegmentsIntersectState(line1, line2)).to.equal('intersect');
		});
	});

	describe('#getLinearRingsIntersectState', function() {
		it('should return \'inside\' for convex linearRing in convex linearRing ', function() {
			let outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let insideLinearRing = [ [ 1, 1 ], [ 3, 1 ], [ 3, 3 ], [ 1, 3 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 1, 0 ], [ 2, 1 ], [ 2, 2 ], [ 1, 3 ], [ -1, 3 ],
				[ -2, 2 ], [ -2, 1 ], [ -1, 0 ], [ 1, 0 ] ];
			insideLinearRing = [ [ 1, 1 ], [ 1, 2 ], [ -1, 2 ], [ -1, 1 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 1, 0 ], [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');
		});

		it('should return \'inside\' for convex linearRing in concave linearRing ', function() {
			let outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let insideLinearRing = [ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 1, 0 ], [ 2, 0 ], [ 2, 1 ], [ 1, 1 ], [ 1, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 1, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 1, 4 ], [ 1, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');
		});

		it('should return \'inside\' for concave linearRing in convex linearRing', function() {
			let outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let insideLinearRing = [ [ 1, 1 ], [ 3, 1 ], [ 2, 2 ],  [ 3, 3 ], [ 1, 3 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 3, 0 ], [ 2, 1 ], [ 3, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');
		});

		it('should return \'inside\' for concave linearRing in concave linearRing', function() {
			let outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let insideLinearRing = [ [ 1, 1 ], [ 3, 1 ], [ 2, 2 ],  [ 3, 3 ], [ 1, 3 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 3, 0 ], [ 2, 1 ], [ 3, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');

			outsideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			insideLinearRing = [ [ 0, 0 ], [ 4, 0 ], [ 2, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(outsideLinearRing, insideLinearRing)).to.equal('inside');
		});

		it('should return \'outside\' for convex linearRing outside convex linearRing', function() {
			let linearRing1 = [ [ 1, 0 ], [ 2, 1 ], [ 2, 2 ], [ 1, 3 ], [ -1, 3 ],
				[ -2, 2 ], [ -2, 1 ], [ -1, 0 ], [ 1, 0 ] ];
			let linearRing2 = [ [ 6, 0 ], [ 7, 0 ], [ 7, 1 ], [ 6, 1 ], [ 6, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');

			linearRing1 = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			linearRing2 = [ [ 0, 0 ], [ 0, 2 ], [ -2, 2 ], [ -2, 0 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');

			linearRing2 = [ [ 0, 0 ], [ -2, 0 ], [ -2, -2 ], [ 0, -2 ], [ 0, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');
		});

		it('should return \'outside\' for convex linearRing outside concave linearRing', function() {
			let linearRing1 = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let linearRing2 = [ [ 6, 0 ], [ 7, 0 ], [ 7, 1 ], [ 6, 1 ], [ 6, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');

			linearRing1 = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			linearRing2 = [ [ 4, 0 ], [ 5, 0 ], [ 5, 4 ], [ 4, 4 ], [ 3, 2 ], [ 4, 0 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');

			linearRing2 = [ [ 3, 2 ], [ 4, 3 ], [ 4, 1 ], [ 3, 2 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('outside');
		});

		it('should return \'outside\' for concave linearRing outside convex linearRing', function() {});

		it('should return \'outside\' for concave linearRing outside concave linearRing', function() {});

		it('should return \'intersect\' for convex linearRing intersect with convex linearRing', function() {
			let linearRing1 = [ [ 0, 0 ], [ 2, 0 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			let linearRing2 = [ [ 1, 1 ], [ 3, 1 ], [ 3, 3 ], [ 1, 3 ], [ 1, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('intersect');

			linearRing2 = [ [ 0, 1 ], [ 2, 1 ], [ 2, 3 ], [ 0, 3 ], [ 0, 1 ] ];

			linearRing1 = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			linearRing2 = [ [ 1, 2 ], [ 1, 4 ], [ -1, 4 ], [ -1, 2 ], [ 1, 2 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('intersect');

		});

		it('should return \'intersect\' for convex linearRing intersect with concave linearRing', function() {
			let linearRing1 = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let linearRing2 = [ [ 0, 2 ], [ 4, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 2 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('intersect');

			linearRing2 = [ [ 2, 1 ], [ 5, 1 ], [ 5, 3 ], [ 2, 3 ], [ 2, 1 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('intersect');
		});

		it('should return \'intersect\' for concave linearRing intersect with concave linearRing', function() {
			let linearRing1 = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let linearRing2 = [ [ 0, 2 ], [ 1, 1 ], [ 1, 5 ], [ -1, 5 ], [ -1, 1 ], [ 0, 2 ] ];
			expect(geometry.getLinearRingsIntersectState(linearRing1, linearRing2)).to.equal('intersect');
		});
	});

	describe('#getRayLineSegmentIntersectState', function() {
		it('should return \'~intersect\' when ray and line segment are in the same line but not overlaping',
		function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let ray = [ [ 3, 3 ], [ 4, 4 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 0, 1 ], [ 0, 2 ] ];
			ray = [ [ 0, 3 ], [ 0, 4 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 1, 0 ], [ 2, 0 ] ];
			ray = [ [ -1, 0 ], [ -2, 0 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');
		});

		it('should return \'~intersect\' for eay and line segment that are parallal to each other', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let ray = [ [ 1, 2 ], [ 2, 3 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 0, 1 ], [ 0, 2 ] ];
			ray = [ [ 1, 1 ], [ 1, 2 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 1, 0 ], [ 1, 1 ] ];
			ray = [ [ 2, 0 ], [ 2, 1 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');
		});

		it('should return \'~intersect\' for ray and line segment that don\'t intersect', function() {
			let line = [ [ 1, 1 ], [ 2, 2 ] ];
			let ray = [ [ 0, 0 ], [ 1, 3 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 0, 1 ], [ 0, 2 ] ];
			ray = [ [ 1, 1 ], [ 2, 2 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');

			line = [ [ 1, 0 ], [ 1, 1 ] ];
			ray = [ [ 2, 2 ], [ 3, 3 ] ];
			expect(geometry.getRayLineSegmentIntersectState(ray, line)).to.equal('~intersect');
		});
	});

	describe('#pointLinearRingState', function() {
		it('should return \'inside\' for point inside a convex linearRing ', function() {
			let linearRing = [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ];
			let point = [ 0.5, 0.5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('inside');

			linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			point = [ 0, 2 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('inside');
		});

		it('should return \'inside\' for point inside a concave linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 2, 0 ], [ 1, 1 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			let point = [ 1, 1.5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('inside');
		});

		it('should return \'outside\' for point outside of a convex linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ];
			let point = [ 3.245, 6.16 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('outside');

			linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			point = [ 0.5, 0.325 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('outside');
		});

		it('should return \'outside\' for point outside of a concave linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 2, 0 ], [ 1, 1 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			let point = [ 2, 1 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('outside');

			point = [ 3, 5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('outside');

			point = [ 1.5, 1 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('outside');
		});

		it('should return \'tangent\' for point on the edge of a convex linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ];
			let point = [ 0, 0 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');

			point = [ 0, 0.5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');

			linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			point = [ -1, 2 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');

			point = [ 0.5, 0.5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');
		});

		it('should return \'tangent\' for point on the edge of a concave linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 2, 0 ], [ 1, 1 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			let point = [ 1, 1 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');

			point = [ 1, 0 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');

			point = [ 1.5, 0.5 ];
			expect(geometry.pointLinearRingState(point, linearRing)).to.equal('tangent');
		});
	});

	describe('#getBoundingBox', function() {
		it('should return the correct bounding box for given convex linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ 0, 0 ] ];
			let { topLeftVertex, width, height } = geometry.getBoundingBox(linearRing);
			expect(topLeftVertex).to.be.an('array');
			expect(topLeftVertex).to.have.length(2);
			expect(topLeftVertex[0]).to.equal(0);
			expect(topLeftVertex[1]).to.equal(1);
			expect(width).to.equal(1);
			expect(height).to.equal(1);

			linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			let bbox = geometry.getBoundingBox(linearRing);
			expect(bbox.topLeftVertex).to.be.an('array');
			expect(bbox.topLeftVertex).to.have.length(2);
			expect(bbox.topLeftVertex[0]).to.equal(-1);
			expect(bbox.topLeftVertex[1]).to.equal(3);
			expect(bbox.width).to.equal(2);
			expect(bbox.height).to.equal(3);
		});

		it('should return the correct bounding box for given concave linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 2, 0 ], [ 1, 1 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ];
			let { topLeftVertex, width, height } = geometry.getBoundingBox(linearRing);
			expect(topLeftVertex).to.be.an('array');
			expect(topLeftVertex).to.have.length(2);
			expect(topLeftVertex[0]).to.equal(0);
			expect(topLeftVertex[1]).to.equal(2);
			expect(width).to.equal(2);
			expect(height).to.equal(2);
		});
	});

	describe('#squareLinearRingIntersectState', function() {
		it('should return \'inside\' for sqaure inside linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			let topLeftVertex = [ 1, 3 ];
			let size = 1;
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('inside');

			topLeftVertex = [ 0, 1 ];
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('inside');

			linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			topLeftVertex = [ -1, 2 ];
			size = 1;
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('inside');

			linearRing = [ [ 0, 0 ], [ 4, 0 ], [ 3, 2 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ];
			topLeftVertex = [ 1, 3 ];
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('inside');
		});

		it('should return \'outside\' for sqaure outside linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			let topLeftVertex = [ 5, 6 ];
			let size = 2;
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('outside');
		});

		it('should return \'intersect\' for sqaure intersects linearRing', function() {
			let linearRing = [ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ];
			let topLeftVertex = [ -2, 2 ];
			let size = 4;
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('intersect');

			linearRing = [ [ 0, 0 ], [ 4, 4 ], [ 4, 8 ], [ 0, 12 ], [ -4, 8 ], [ -4, 4 ], [ 0, 0 ] ];
			topLeftVertex = [ -256, 256 ];
			size = 256;
			expect(geometry.squareLinearRingIntersectState(linearRing, topLeftVertex, size)).to.equal('intersect');
		});
	});

	describe('isPointInsidePolygon', function() {
		it('should return true for point inside polygon', function() {
			let polygon = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 2, 0 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ]
				]
			};
			let point = [ 1, 1 ];
			let result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);
		});

		it('should return true for point inside exterior and outside all interiors', function() {
			let polygon = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ],
					[ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ], [ 1, 1 ] ],
					[ [ 3, 2 ], [ 3.5, 2 ], [ 3.5, 3 ], [ 3, 3 ], [ 3, 2 ] ]
				]
			};
			let point = [ 2, 3 ];
			let result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);
		});

		it('should return false for point outside exterior', function() {
			let polygon = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 2, 0 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ]
				]
			};
			let point = [ 5, 6 ];
			let result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(false);
		});

		it('should return false for point inside interior', function() {
			let polygon = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ],
					[ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ], [ 1, 1 ] ],
					[ [ 3, 2 ], [ 3.5, 2 ], [ 3.5, 3 ], [ 3, 3 ], [ 3, 2 ] ]
				]
			};
			let point = [ 1.5, 1.5 ];
			let result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(false);
		});

		it('should return true for point lying on boundry of polygon', function() {
			let polygon = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 4, 0 ], [ 4, 4 ], [ 0, 4 ], [ 0, 0 ] ],
					[ [ 1, 1 ], [ 2, 1 ], [ 2, 2 ], [ 1, 2 ], [ 1, 1 ] ],
					[ [ 3, 2 ], [ 3.5, 2 ], [ 3.5, 3 ], [ 3, 3 ], [ 3, 2 ] ]
				]
			};
			let point = [ 3, 0 ];
			let result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);

			point = [ 1.5, 1 ];
			result = geometry.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);
		});

		it('should return true for point in MultiPolygon', function() {
			let range = {
				type: 'MultiPolygon',
				coordinates: [ [
					[ [ 0, 0 ], [ 2, 0 ], [ 2, 2 ], [ 0, 2 ], [ 0, 0 ] ],
					[ [ 4, 4 ], [ 5, 4 ], [ 5, 5 ], [ 4, 5 ], [ 4, 4 ] ]
				] ]
			};
			let point = [ 1, 1 ];
			let result = geometry.isPointInsidePolygon(point, range);
			expect(result).to.equal(true);

			range = {
				type: 'MultiPolygon',
				coordinates: [
					[
						[ [ 0, 0 ], [ 8, 0 ], [ 8, 8 ], [ 0, 8 ], [ 0, 0 ] ],
						[ [ 1, 1 ], [ 7, 1 ], [ 7, 7 ], [ 1, 7 ], [ 1, 1 ] ]
					],
					[
						[ [ 2, 2 ], [ 4, 2 ], [ 4, 4 ], [ 2, 4 ], [ 2, 2 ] ]
					]
				]
			};
			point = [ 3, 3 ];
			result = geometry.isPointInsidePolygon(point, range);
			expect(result).to.equal(true);
		});
	});

});
