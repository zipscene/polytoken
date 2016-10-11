const XError = require('xerror');
const { expect } = require('chai');
const { LongLatRadiusDimension } = require('../lib/core-dimensions');

describe('LongLatRadiusDimension', function() {

	before(function() {
		this.longLatRadiusDimension = new LongLatRadiusDimension({
			step: {
				type: 'exponential',
				base: 2,
				multiplier: 2,
				stepNum: 8
			}
		});
	});

	it('normalizeRange', function() {
		let range = {
			point: [ 30, 40 ],
			radius: 1000
		};
		let normalized = this.longLatRadiusDimension.normalizeRange(range);
		expect(normalized).to.deep.equal({
			point: {
				type: 'Point',
				coordinates: [ 30, 40 ]
			},
			radius: 1000
		});

		let badRange = {
			point: 'NOPE',
			radius: 1000
		};
		expect(() => this.longLatRadiusDimension.normalizeRange(badRange)).to.throw(XError);
	});

	it('normalizePoint', function() {
		let point = [ 30, 40 ];
		let normalized = this.longLatRadiusDimension.normalizePoint(point);
		expect(normalized).to.deep.equal({
			type: 'Point',
			coordinates: [ 30, 40 ]
		});

		let badPoint = 'NOPE';
		expect(() => this.longLatRadiusDimension.normalizePoint(badPoint)).to.throw(XError);
	});

	it('getRangeTokens', function() {
		let range = {
			point: [ -80, 30 ],
			radius: 10000
		};
		let rangeTokens = this.longLatRadiusDimension.getRangeTokens(range);
		expect(rangeTokens).to.have.length(4);
		expect(rangeTokens).to.include('-82,32^2');
		expect(rangeTokens).to.include('-82,30^2');
		expect(rangeTokens).to.include('-82,32^2');
		expect(rangeTokens).to.include('-80,30^2');
	});

	it('checkRangeInclusion', function() {
		let range = {
			point: [ 30, 40 ],
			radius: 10000
		};
		let insidePoint = [ 30.05, 40.05 ];
		expect(this.longLatRadiusDimension.checkRangeInclusion(range, insidePoint)).to.equal(true);
		let outsidePoint = [ 30.1, 40.1 ];
		expect(this.longLatRadiusDimension.checkRangeInclusion(range, outsidePoint)).to.equal(false);
	});

});
