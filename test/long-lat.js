const { expect } = require('chai');
const { LongLatDimension } = require('../lib/core-dimensions');

describe('LongLatDimension', function() {
	before(function() {
		this.longLatDimension = new LongLatDimension({
			step: {
				type: 'exponential',
				base: 1,
				exponent: 2,
				stepNum: 8
			}
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
	});
});
