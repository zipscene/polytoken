let expect = require('chai').expect;
const { NumericDimension } = require('../lib/core-dimensions');

describe('NumericDimension', function() {
	before(function() {
		this.numeric = new NumericDimension('numeric', {
			step: {
				type: 'exponential',
				base: 2,
				stepNum: 8
			}
		});
		this.numeric2 = new NumericDimension('numeric2', {
			step: {
				type: 'exponential',
				base: 3,
				stepNum: 4
			}
		});
	});

	describe('#constructor', function() {
		it('should set name, config object and generate steps', function() {
			let numeric = this.numeric;
			expect(numeric).to.have.property('name', 'numeric');
			expect(numeric.tokenConfig).to.deep.equal({
				step: {
					type: 'exponential',
					base: 2,
					stepNum: 8
				}
			});
			expect(numeric).to.have.property('steps');
			expect(numeric.steps).to.be.an('array');
			expect(numeric.steps).to.deep.equal([ 256, 128, 64, 32, 16, 8, 4, 2 ]);

			let numeric2 = this.numeric2;
			expect(numeric2).to.have.property('name', 'numeric2');
			expect(numeric2.tokenConfig).to.deep.equal({
				step: {
					type: 'exponential',
					base: 3,
					stepNum: 4
				}
			});
			expect(numeric2).to.have.property('steps');
			expect(numeric2.steps).to.be.an('array');
			expect(numeric2.steps).to.deep.equal([ 81, 27, 9, 3 ]);
		});
	});

	describe('#getName', function() {
		it('should return name of the dimension', function() {
			expect(this.numeric).to.have.property('name', 'numeric');
			expect(this.numeric2).to.have.property('name', 'numeric2');
		});
	});

	describe('#validateRange', function() {
		it('should return true for valid range containing integers', function() {
			let range = [ 3, 18 ];
			expect(this.numeric.validateRange(range)).to.be.true;
			expect(this.numeric2.validateRange(range)).to.be.true;
		});

		it('should return true for valid range containing float numbers', function() {
			let range = [ 1.52, 9.38 ];
			expect(this.numeric.validateRange(range)).to.be.true;
			expect(this.numeric2.validateRange(range)).to.be.true;
		});

		it('should return true for valid range containing negative numbers', function() {
			let range = [ -3, 2.18 ];
			expect(this.numeric.validateRange(range)).to.be.true;
			expect(this.numeric2.validateRange(range)).to.be.true;
		});

		it('should throw error when range isn\'t an array', function() {
			let range = 34.5;
			try {
				this.numeric.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('message', 'Invalid Range');
				expect(ex).to.have.property('data', 'Range of numberic dimensions should be an array');
			}
		});

		it('should thorw error when range length is not two', function() {
			let range = [ 1, 2, 3 ];
			try {
				this.numeric.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('message', 'Invalid Range');
				expect(ex).to.have.property('data', 'Range of numberic dimensions should have length of two');
			}
		});

		it('should throw error when range contains non numeric value', function() {
			let range = [ 1, 'blah' ];
			try {
				this.numeric.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('message', 'Invalid Range');
				expect(ex).to.have.property('data', 'Range of numberic dimensions should consist of numbers');
			}
		});

		it('should throw error when range upper bound is not greater than lower bound', function() {
			let range = [ 10.34, 2.1 ];
			try {
				this.numeric.validateRange(range);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('message', 'Invalid Range');
				expect(ex).to.have.property('data', 'Range upper bound must be greater than range lower bound');
			}
		});
	});

	describe('#validatePoint', function() {
		it('should return true for a valid integer point', function() {
			let point = 12;
			expect(this.numeric.validatePoint(point)).to.be.true;
			expect(this.numeric2.validatePoint(point)).to.be.true;
		});

		it('should return true for a valid float point', function() {
			let point = 1.34;
			expect(this.numeric.validatePoint(point)).to.be.true;
			expect(this.numeric2.validatePoint(point)).to.be.true;
		});

		it('should return true for a valid negative point', function() {
			let point = -3;
			expect(this.numeric.validatePoint(point)).to.be.true;
			expect(this.numeric2.validatePoint(point)).to.be.true;
		});

		it('should throw error if point is not a number', function() {
			let point = '12';
			try {
				this.numeric.validatePoint(point);
			} catch (ex) {
				expect(ex).to.exist;
				expect(ex).to.have.property('message', 'Invalid Point');
				expect(ex).to.have.property('data', 'Numeric point should be a number');

			}
		});
	});

	describe('#getRangeTokens', function() {
		it('should return all tokens for range that falls on grid', function() {
			let range = [ 2, 4 ];
			let tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('2^2');

			range = [ 16, 1024 ];
			tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(7);
			expect(tokens).to.include('256^256');
			expect(tokens).to.include('512^256');
			expect(tokens).to.include('768^256');
			expect(tokens).to.include('128^128');
			expect(tokens).to.include('64^64');
			expect(tokens).to.include('32^32');
			expect(tokens).to.include('16^16');

			range = [ 18, 30 ];
			tokens = this.numeric2.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(2);
			expect(tokens).to.include('18^9');
			expect(tokens).to.include('27^3');
		});

		it('should return all tokens for range that doesn\'t fall on grid', function() {
			let range = [ 2, 254 ];
			let tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(12);
			expect(tokens).to.include('64^64');
			expect(tokens).to.include('128^64');
			expect(tokens).to.include('192^32');
			expect(tokens).to.include('224^16');
			expect(tokens).to.include('240^8');
			expect(tokens).to.include('248^4');
			expect(tokens).to.include('252^2');
			expect(tokens).to.include('32^32');
			expect(tokens).to.include('16^16');
			expect(tokens).to.include('8^8');
			expect(tokens).to.include('4^4');
			expect(tokens).to.include('2^2');

			range = [ 2, 3 ];
			tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('2^2');

			range = [ 3.2, 3.3 ];
			tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include('2^2');

			range = [ 4.2, 11.56 ];
			tokens = this.numeric.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include('6^2');
			expect(tokens).to.include('8^2');
			expect(tokens).to.include('10^2');
			expect(tokens).to.include('4^2');

			range = [ 3.1, 79.2 ];
			tokens = this.numeric2.getRangeTokens(range);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(10);
			expect(tokens).to.include('27^27');
			expect(tokens).to.include('54^9');
			expect(tokens).to.include('63^9');
			expect(tokens).to.include('72^3');
			expect(tokens).to.include('75^3');
			expect(tokens).to.include('75^3');
			expect(tokens).to.include('78^3');
			expect(tokens).to.include('18^9');
			expect(tokens).to.include('9^9');
			expect(tokens).to.include('6^3');
			expect(tokens).to.include('3^3');
		});
	});

	describe('#getTokensForPoint', function() {
		it('should return all tokens covering given point', function() {
			let point = 2.4;
			let tokens = this.numeric.getTokensForPoint(point);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(8);
			expect(tokens).to.include('2^2');
			expect(tokens).to.include('0^4');
			expect(tokens).to.include('0^8');
			expect(tokens).to.include('0^16');
			expect(tokens).to.include('0^32');
			expect(tokens).to.include('0^64');
			expect(tokens).to.include('0^128');
			expect(tokens).to.include('0^256');
		});
	});
});
