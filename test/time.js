// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

let expect = require('chai').expect;
const { coreDimensions: { TimeDimension } } = require('../lib');
const _ = require('lodash');

describe('TimeDimension', function() {

	before(function() {
		this.dimension = new TimeDimension({
			step: {
				type: 'exponential',
				base: 100,
				multiplier: 10,
				stepNum: 5
			}
		});
	});

	describe('#getRangeTokens', function() {

		it('should return up to two tokens for a range', function() {
			let range1 = [ '2015-12-25T00:00:00Z', '2015-12-25T23:59:59Z' ];
			let tokens1 = [ '1451000000^100000' ];
			expect(this.dimension.getRangeTokens(range1)).to.deep.equal(tokens1);
			let range2 = [ '2015-12-26T00:00:00Z', '2015-12-26T23:59:59Z' ];
			let tokens2 = [ '1451000000^100000', '1451100000^100000' ];
			expect(this.dimension.getRangeTokens(range2)).to.deep.equal(tokens2);
			let range3 = [ '2015-12-25T00:00:00Z', '2015-12-25T00:59:59Z' ];
			let tokens3 = [ '1451000000^10000' ];
			expect(this.dimension.getRangeTokens(range3)).to.deep.equal(tokens3);
			let range4 = [ '2015-12-25T00:00:00Z', '2015-12-25T00:00:02Z' ];
			let tokens4 = [ '1451001600^100' ];
			expect(this.dimension.getRangeTokens(range4)).to.deep.equal(tokens4);
		});

		it('should fill up very large time ranges', function() {
			let range = [ '2015-01-01T00:00:00Z', '2015-04-01T00:00:00Z' ];
			let tokens = [
				'1420000000^1000000',
				'1421000000^1000000',
				'1422000000^1000000',
				'1423000000^1000000',
				'1424000000^1000000',
				'1425000000^1000000',
				'1426000000^1000000',
				'1427000000^1000000'
			];
			expect(this.dimension.getRangeTokens(range)).to.deep.equal(tokens);
		});

	});

	describe('#getTokensForPoint', function() {

		it('should return all required tokens', function() {
			let point = '2015-12-25T00:00:00Z';
			let pointTokens = [];
			expect(this.dimension.getTokensForPoint(point).length).to.equal(5);
			expect(this.dimension.getTokensForPoint(point)).to.include('1451000000^1000000');
			expect(this.dimension.getTokensForPoint(point)).to.include('1451000000^100000');
			expect(this.dimension.getTokensForPoint(point)).to.include('1451000000^10000');
			expect(this.dimension.getTokensForPoint(point)).to.include('1451001000^1000');
			expect(this.dimension.getTokensForPoint(point)).to.include('1451001600^100');
		});

	});

	describe('#checkRangeInclusion', function() {

		it('should accurately assess range inclusion', function() {
			let range = [ '2015-12-25T00:00:00Z', '2015-12-25T23:59:59Z' ];
			expect(this.dimension.checkRangeInclusion(range, '2014-01-01T00:00:00Z')).to.equal(false);
			expect(this.dimension.checkRangeInclusion(range, '2015-12-25T00:00:00Z')).to.equal(true);
			expect(this.dimension.checkRangeInclusion(range, '2015-12-25T15:00:00Z')).to.equal(true);
			expect(this.dimension.checkRangeInclusion(range, '2015-12-25T23:59:59Z')).to.equal(true);
			expect(this.dimension.checkRangeInclusion(range, '2016-01-01T00:00:00Z')).to.equal(false);
		});

	});

});
