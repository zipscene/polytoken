const { expect } = require('chai');
const utils = require('../lib/utils');

describe('utils', function() {
	describe('#roundToFiveSignificantDigits', function() {
		it('should keep five significant digits for a given number', function() {
			let input = 12;
			let output = utils.roundToFiveSignificantDigits(input);
			expect(output).to.equal(12);

			input = 12.34;
			output = utils.roundToFiveSignificantDigits(input);
			expect(output).to.equal(12.34);

			input = 12.12345678;
			output = utils.roundToFiveSignificantDigits(input);
			expect(output).to.equal(12.12346);

			input = 12.123450000001;
			output = utils.roundToFiveSignificantDigits(input);
			expect(output).to.equal(12.12345);
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
			let result = utils.isPointInsidePolygon(point, polygon);
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
			let result = utils.isPointInsidePolygon(point, polygon);
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
			let result = utils.isPointInsidePolygon(point, polygon);
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
			let result = utils.isPointInsidePolygon(point, polygon);
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
			let result = utils.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);

			point = [ 1.5, 1 ];
			result = utils.isPointInsidePolygon(point, polygon);
			expect(result).to.equal(true);
		});
	});
});
