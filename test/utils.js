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

	describe('#genTokensForLongLatPoint', function() {
		it('should return all the tokens for given point', function() {
			let point = {
				type: 'Point',
				coordinates: [ 2, 3 ]
			};
			let steps = [ 256, 128, 64, 32, 16, 8, 4, 2 ];
			let tokens = utils.genTokensForLongLatPoint(point, steps);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(9);
			expect(tokens).to.include('0,256^256');
			expect(tokens).to.include('0,128^128');
			expect(tokens).to.include('0,64^64');
			expect(tokens).to.include('0,32^32');
			expect(tokens).to.include('0,16^16');
			expect(tokens).to.include('0,8^8');
			expect(tokens).to.include('0,4^4');
			expect(tokens).to.include('2,4^2');
			expect(tokens).to.include('0,4^2');

			point = {
				type: 'Point',
				coordinates: [ 2, 2 ]
			};
			tokens = utils.genTokensForLongLatPoint(point, steps);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(11);
			expect(tokens).to.include('0,256^256');
			expect(tokens).to.include('0,128^128');
			expect(tokens).to.include('0,64^64');
			expect(tokens).to.include('0,32^32');
			expect(tokens).to.include('0,16^16');
			expect(tokens).to.include('0,8^8');
			expect(tokens).to.include('0,4^4');
			expect(tokens).to.include('2,4^2');
			expect(tokens).to.include('2,2^2');
			expect(tokens).to.include('0,4^2');
			expect(tokens).to.include('0,2^2');
		});
	});
});
