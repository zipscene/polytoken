const { expect } = require('chai');
const { LongLatDimension } = require('../lib/core-dimensions');

describe('LongLatDimension', function() {
	before(function() {
		this.longLatDimension = new LongLatDimension({
			step: {
				type: 'exponential',
				base: 2,
				multiplier: 2,
				stepNum: 8
			}
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

		it('should allow simple longlat array', function() {
			let point = [ 3, 4 ];
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

	describe('#normalizeRange', function() {
		it('should return the polygon if it is a normal polygon', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ]
				]
			};
			this.longLatDimension.normalizeRange(range);
			expect(range).to.deep.equal({
				type: 'Polygon',
				coordinates: [
					[ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 0, 0 ] ]
				]
			});
		});
	});

	describe('#getRangeTokens', function() {
		it('should return all the tokens for convex polygon that doesn\'t have holes', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ], [ 1, 1 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('0,2^2');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 32, 32 ], [ 64, 32 ], [ 64, 64 ], [ 32, 64 ], [ 32, 32 ]  ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('32,64^32');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 28, 35 ], [ 28, 10 ], [ 48, 10 ], [ 48, 35 ], [ 28, 35 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include('32,32^32');
			expect(tokens).to.include('32,64^32');
			expect(tokens).to.include('0,32^32');
			expect(tokens).to.include('0,64^32');

			range = {
				type: 'Polygon',
				coordinates: [
					[ [ 1, 1 ], [ 2, 0 ], [ 3, 1 ], [ 2, 2 ], [ 1, 1 ] ]
				]
			};
			tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(2);
			expect(tokens).to.include('0,2^2');
			expect(tokens).to.include('2,2^2');
		});

		it('should return all tokens for convex polygon that has holes', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 16 ], [ 0, 0 ], [ 16, 0 ], [ 16, 16 ], [ 0, 16 ] ],
					[ [ 3, 4 ], [ 2, 2 ], [ 5, 1 ], [ 3, 4 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('0,16^16');
		});

		it('should return all tokens for concave polygon that doesn\'t have holes', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 0, 2 ], [ 0, 0 ], [ 4, 0 ], [ 3, 1 ], [ 4, 2 ], [ 0, 2 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('0,4^4');
		});

		it('should return all tokens for concave polygon that have holes', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 2, 0 ], [ 4, 0 ], [ 4, 2 ], [ 6, 2 ], [ 6, 4 ], [ 4, 4 ], [ 4, 6 ], [ 2, 6 ],
						[ 2, 4 ], [ 0, 4 ], [ 0, 2 ], [ 2, 2 ], [ 2, 0 ] ],
					[ [ 2, 1 ], [ 4, 1 ], [ 3, 2 ], [ 2, 1 ] ],
					[ [ 2, 4 ], [ 4, 2 ], [ 3, 5 ], [ 2, 4 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('0,8^8');
		});

		it('should generate correct tokens for polygon covering meridian', function() {
			let range = {
				type: 'Polygon',
				coordinates: [
					[ [ 182, 2 ], [ 184, 2 ], [ 184, 4 ], [ 182, 4 ], [ 182, 2 ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('-178,4^2');
		});

		it('should handle MultiPolygon', function() {
			let range = {
				type: 'MultiPolygon',
				coordinates: [
					[ [ [ 28, 35 ], [ 28, 10 ], [ 48, 10 ], [ 48, 35 ], [ 28, 35 ] ] ],
					[ [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ], [ 1, 1 ] ] ]
				]
			};
			let tokens = this.longLatDimension.getRangeTokens(range);
			expect(tokens.length).to.equal(5);
			expect(tokens).to.include('0,64^32');
			expect(tokens).to.include('0,32^32');
			expect(tokens).to.include('32,64^32');
			expect(tokens).to.include('32,32^32');
			expect(tokens).to.include('0,2^2');
		});
	});

	describe('#getTokensForPoint', function() {
		it('should get all tokens covering the given point', function() {
			let point = {
				type: 'Point',
				coordinates: [ 3, 3 ]
			};
			let tokens = this.longLatDimension.getTokensForPoint(point);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(8);
			expect(tokens).to.include('0,256^256');
			expect(tokens).to.include('0,128^128');
			expect(tokens).to.include('0,64^64');
			expect(tokens).to.include('0,32^32');
			expect(tokens).to.include('0,16^16');
			expect(tokens).to.include('0,8^8');
			expect(tokens).to.include('0,4^4');
			expect(tokens).to.include('2,4^2');
		});
	});

	describe('#checkRangeInclusion', function() {
		it('should return true for point inside polygon', function() {});
	});
});
