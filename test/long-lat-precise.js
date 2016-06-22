const { expect } = require('chai');
const { LongLatPrecise } = require('../lib/core-dimensions');

describe('LongLatPrecise', function() {
	before(function() {
		this.longLatDimension = new LongLatPrecise({
			step: {
				type: 'exponential',
				base: 2,
				multiplier: 2,
				stepNum: 8
			}
		});
	});

	describe('#constructor', function() {
		it('should set name, config object and generate steps', function() {
			let longLatDimension = this.longLatDimension;
			expect(longLatDimension).to.have.property('name', 'LongLatPrecise');
			expect(longLatDimension.tokenConfig).to.deep.equal({
				step: {
					type: 'exponential',
					base: 2,
					multiplier: 2,
					stepNum: 8
				}
			});
			expect(longLatDimension).to.have.property('steps');
			expect(longLatDimension.steps).to.be.an('array');
			expect(longLatDimension.steps).to.deep.equal([ 256, 128, 64, 32, 16, 8, 4, 2 ]);
		});
	});

	describe('#getName', function() {
		it('should return name of this dimension', function() {
			let name = this.longLatDimension.getName();
			expect(name).to.equal('LongLatPrecise');
		});
	});

	describe('#validateRange', function() {
		it('should return true for valid polygon', function() {
			let range = {
				type: 'Polygon',
				coordinates: [ [
					[ 100.0, 0.0 ], [ 101.0, 0.0 ], [ 101.0, 1.0 ], [ 100.0, 1.0 ], [ 100.0, 0.0 ]
				] ]
			};
			expect(this.longLatDimension.validateRange(range)).to.be.true;

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 100.0, 0.0 ], [ 104.0, 0.0 ], [ 104.0, 4.0 ], [ 100.0, 4.0 ], [ 100.0, 0.0 ] ],
					[ [ 101.0, 0.0 ], [ 103.0, 0.0 ], [ 103.0, 2.0 ], [ 101.0, 2.0 ], [ 101.0, 0.0 ] ]
				]
			};
			expect(this.longLatDimension.validateRange(range)).to.be.true;

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 178, 0 ], [ 182, 0 ], [ 182, 2 ], [ 178, 2 ], [ 178, 0 ] ]
				]
			};
			expect(this.longLatDimension.validateRange(range)).to.be.true;

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ -178, 0 ], [ -182, 0 ], [ -182, 2 ], [ -178, 2 ], [ -178, 0 ] ]
				]
			};
			expect(this.longLatDimension.validateRange(range)).to.be.true;

		});

		it('should throw error for invalid geojson object', function() {
			let range = {
				type: 'unknown'
			};
			try {
				this.longLatDimension.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_range');
				expect(ex).to.have.property('message', 'range of long-lat dimension is not a valid geojson object');
			}
		});

		it('should throw error for non-polygon geojson object', function() {
			let range = {
				type: 'Point',
				coordinates: [ 102.0, 0.5 ]
			};
			try {
				this.longLatDimension.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_range');
				expect(ex).to.have.property(
					'message',
					'range of long-lat dimension is not a valid Polygon or MultiPolygon'
				);
			}
		});

		it('should throw error for invalid polygon', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 100.0, 0.0 ], [ 104.0, 0.0 ], [ 104.0, 4.0 ], [ 100.0, 4.0 ], [ 100.0, 0.0 ] ],
					[ [ 90.0, 0.0 ], [ 91.0, 0.0 ], [ 91.0, 1.0 ], [ 90.0, 1.0 ], [ 90.0, 0.0 ] ]
				]
			};
			try {
				this.longLatDimension.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_range');
				expect(ex).to.have.property('message', 'range of long-lat dimension is not a valid polygon');
			}

			range = {
				type: 'Polygon',
				coordinates: []
			};
			try {
				this.longLatDimension.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_range');
				expect(ex).to.have.property('message', 'range of long-lat dimension is not a valid polygon');
			}
		});
	});

	describe('#validatePoint', function() {
		it('should return true for valid geojson point', function() {
			let point = {
				type: 'Point',
				coordinates: [ 1, 2 ]
			};
			expect(this.longLatDimension.validatePoint(point)).to.be.true;
		});

		it('should throw error for invalid geojson object', function() {
			let point = {
				type: 'unknown'
			};
			try {
				this.longLatDimension.validatePoint(point);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_point');
				expect(ex).to.have.property('message', 'point of long-lat dimension is not a valid geojson object');
			}
		});

		it('should throw error for non-point geojson object', function() {
			let point = {
				type: 'LineString',
				coordinates: [ [ 102.0, 0.0 ], [ 103.0, 1.0 ], [ 104.0, 0.0 ], [ 105.0, 1.0 ] ]
			};
			try {
				this.longLatDimension.validatePoint(point);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_point');
				expect(ex).to.have.property('message', 'point of long-lat dimension is not a valid point');
			}
		});

		it('should throw error for invalid geojson point', function() {
			let point = {
				type: 'Point',
				coordinates: [ 380, 97 ]
			};
			try {
				this.longLatDimension.validatePoint(point);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_point');
				expect(ex).to.have.property('message', 'point of long-lat dimension is not a valid point');
			}

			point = {
				type: 'Point',
				coordinates: [ 182, 40 ]
			};
			try {
				this.longLatDimension.validatePoint(point);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_point');
				expect(ex).to.have.property('message', 'point of long-lat dimension is not a valid point');
			}
		});
	});

	describe('#normalizeRange', function() {});

	describe('#getRangeTokens', function() {
		it('should return all the tokens for given range that has no interior', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 48, 0 ], [ 54, 0 ], [ 54, 6 ], [ 48, 6 ], [ 48, 0 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(6);
			expect(tokens).to.include('48,4^4');
			expect(tokens).to.include('48,6^2');
			expect(tokens).to.include('50,6^2');
			expect(tokens).to.include('52,6^2');
			expect(tokens).to.include('52,4^2');
			expect(tokens).to.include('52,2^2');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 0, 32 ], [ 32, 32 ], [ 32, 0 ], [ 0, 0 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('0,32^32');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 1, 1 ], [ 1, 2 ], [ 0, 3 ], [ -1, 2 ], [ -1, 1 ], [ 0, 0 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include('0,2^2');
			expect(tokens).to.include('0,4^2');
			expect(tokens).to.include('-2,2^2');
			expect(tokens).to.include('-2,4^2');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 4, 4 ], [ 4, 8 ], [ 0, 12 ], [ -4, 8 ], [ -4, 4 ], [ 0, 0 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(14);
			expect(tokens).to.include('0,8^4');
			expect(tokens).to.include('0,4^2');
			expect(tokens).to.include('0,2^2');
			expect(tokens).to.include('2,4^2');
			expect(tokens).to.include('0,10^2');
			expect(tokens).to.include('0,12^2');
			expect(tokens).to.include('2,10^2');
			expect(tokens).to.include('-4,8^4');
			expect(tokens).to.include('-2,4^2');
			expect(tokens).to.include('-2,2^2');
			expect(tokens).to.include('-4,4^2');
			expect(tokens).to.include('-2,10^2');
			expect(tokens).to.include('-2,12^2');
			expect(tokens).to.include('-4,10^2');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 4, 4 ], [ 8, 4 ], [ 6, 6 ], [ 8, 8 ], [ 4, 8 ], [ 4, 4 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include('4,6^2');
			expect(tokens).to.include('4,8^2');
			expect(tokens).to.include('6,6^2');
			expect(tokens).to.include('6,8^2');
		});

		it('should return all the tokens for given range that has interiors', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 8, 0 ], [ 8, 8 ], [ 0, 8 ], [ 0, 0 ] ],
					[ [ 2, 2 ], [ 4, 2 ], [ 4, 4 ], [ 2, 4 ], [ 2, 2 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(6);
			expect(tokens).to.include('0,2^2');
			expect(tokens).to.include('0,4^2');
			expect(tokens).to.include('2,2^2');
			expect(tokens).to.include('4,4^4');
			expect(tokens).to.include('0,8^4');
			expect(tokens).to.include('4,8^4');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 2, 2 ], [ 2, 4 ], [ 0, 6 ], [ -2, 4 ], [ -2, 2 ], [ 0, 0 ] ],
					[ [ -1, 2 ], [ 1, 2 ], [ 1, 4 ], [ -1, 4 ], [ -1, 2 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(6);
			expect(tokens).to.include('0,2^2');
			expect(tokens).to.include('0,4^2');
			expect(tokens).to.include('0,6^2');
			expect(tokens).to.include('-2,2^2');
			expect(tokens).to.include('-2,4^2');
			expect(tokens).to.include('-2,6^2');
		});

		it('should return correct tokens for range covering meridian', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 178, 0 ], [ 184, 0 ], [ 184, 2 ], [ 178, 2 ], [ 178, 0 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(3);
			expect(tokens).to.include('178,2^2');
			expect(tokens).to.include('180,2^2');
			expect(tokens).to.include('-178,2^2');
		});
	});
});
