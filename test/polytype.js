const { expect } = require('chai');
const { Polytype, coreDimensions: { NumericDimension } } = require('../lib');

describe('Polytype', function() {
	before(function() {
		this.numeric1 = new NumericDimension('numeric1', {
			step: {
				type: 'exponential',
				base: 2,
				multiplier: 2,
				stepNum: 4
			}
		});
		this.numeric2 = new NumericDimension('numeric2', {
			step: {
				type: 'exponential',
				base: 3,
				multiplier: 3,
				stepNum: 2
			}
		});
	});

	describe('#constructor', function() {
		it('should set dimensions and delimiter', function() {
			let polyType = new Polytype([ this.numeric1, this.numeric2 ]);
			expect(polyType).to.have.property('delimiter', '&');
			expect(polyType.dimensions).to.be.an('array');
			expect(polyType.dimensions).to.have.length(2);
			for (let dimension of polyType.dimensions) {
				expect(dimension).to.be.an.instanceof(NumericDimension);
			}
		});

		it('should throw error when passing non-array as dimensions', function() {
			try {
				let polyType = new Polytype(this.numeric1);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_argument');
				expect(ex).to.have.property('message', 'dimensions must be an array');
			}
		});

		it('should throw error when dimensions contains entrie that\'s not an instance of Dimension', function() {
			try {
				let polyType = new Polytype([ this.numeric1, 'numeric2' ]);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_argument');
				expect(ex.message).to.include('is not an instance of Dimension');
			}
		});
	});

	describe('#getRangeTokens', function() {
		it('should generate all tokens given range for each dimension', function() {
			let rangeTuple = [ [ 2, 6 ], [ 3, 9 ] ];
			let polyType = new Polytype([ this.numeric1, this.numeric2 ]);
			let tokens = polyType.getRangeTokens(rangeTuple);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include('2^2&3^3');
			expect(tokens).to.include('2^2&6^3');
			expect(tokens).to.include('4^2&3^3');
			expect(tokens).to.include('4^2&6^3');
		});

		it('should fail when invalid ranges are given', function() {
			let rangeTuple = [ 2, [ 3, 9 ] ];
			let polyType = new Polytype([ this.numeric1, this.numeric2 ]);
			try {
				polyType.getRangeTokens(rangeTuple);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_range');
				expect(ex).to.have.property('message', 'Range of numeric1 dimension should be an array');
			}
		});
	});

	describe('#getTokensForPoint', function() {
		it('should generate all tokens for given point', function() {
			let pointTuple = [ 2.3, 4.87 ];
			let polyType = new Polytype([ this.numeric1, this.numeric2 ]);
			let tokens = polyType.getTokensForPoint(pointTuple);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(8);
			expect(tokens).to.include('2^2&3^3');
			expect(tokens).to.include('2^2&0^9');
			expect(tokens).to.include('0^4&3^3');
			expect(tokens).to.include('0^4&0^9');
			expect(tokens).to.include('0^8&3^3');
			expect(tokens).to.include('0^8&0^9');
			expect(tokens).to.include('0^16&3^3');
			expect(tokens).to.include('0^16&0^9');
		});


		it('should fail when given invalid point', function() {
			let pointTuple = [ 3, '5' ];
			let polytype = new Polytype([ this.numeric1, this.numeric2 ]);
			try {
				polytype.getTokensForPoint(pointTuple);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('code', 'invalid_point');
				expect(ex).to.have.property('message', 'Numeric point should be a number');
			}
		});
	});

	describe('#checkRangeInclusion', function() {
		it('should accurately assess range inclusion', function() {
			let polytype = new Polytype([ this.numeric1, this.numeric2 ]);
			let rangeTuple = [
				[ 1, 5 ],
				[ 10, 50 ]
			];
			expect(polytype.checkRangeInclusion(rangeTuple, [ 2, 20 ])).to.equal(true);
			expect(polytype.checkRangeInclusion(rangeTuple, [ 1, 25 ])).to.equal(true);
			expect(polytype.checkRangeInclusion(rangeTuple, [ 4, 50 ])).to.equal(true);
			expect(polytype.checkRangeInclusion(rangeTuple, [ 3, 55 ])).to.equal(false);
		});
	});

});
