const _ = require('lodash');
const moment = require('moment');
const { expect } = require('chai');
const { coreDimensions: { TimeDetailedDimension } } = require('../lib');

describe('TimeDimension', function() {
	before(function() {
		this.time = new TimeDetailedDimension({
			step: {
				type: 'customized',
				steps: [ 1000, 60000, 3600000, 86400000 ]
			}
		});
	});

	describe('#constructor', function() {
		it('should set name and tokenConfig', function() {
			expect(this.time).to.be.instanceof(TimeDetailedDimension);
			expect(this.time).to.have.property('name', 'TimeDetailed');
			expect(this.time.tokenConfig).to.deep.equal({
				step: {
					type: 'customized',
					steps: [ 86400000, 3600000, 60000, 1000 ]
				}
			});
		});
	});

	describe('#getName', function() {
		it('should get name of time dimension', function() {
			let name = this.time.getName();
			expect(name).to.equal('TimeDetailed');
		});
	});

	describe('#validateRange', function() {
		it('should return true for valid range of timestamps', function() {
			let range = [ Date.now(), Date.now() + 10 ];
			expect(this.time.validateRange(range)).to.be.true;
		});

		it('should return true for valid range of Date instances', function() {
			let range = [ new Date(), new Date(Date.now() + 10) ];
			expect(this.time.validateRange(range)).to.be.true;
		});

		it('should return true for valid range of ISO date strings', function() {
			let date1 = new Date();
			let date2 = new Date(Date.now() + 10);
			let range = [ date1.toISOString(), date2.toISOString() ];
			expect(this.time.validateRange(range)).to.be.true;
		});
	});

	describe('#validatePoint', function() {
		it('should return true for valid point of timestamps', function() {
			let point = Date.now();
			expect(this.time.validatePoint(point)).to.be.true;
		});

		it('should return true for valid point of Date instances', function() {
			let point = new Date();
			expect(this.time.validatePoint(point)).to.be.true;
		});

		it('should return true for valid point of ISO date strings', function() {
			let point = (new Date()).toISOString();
			expect(this.time.validatePoint(point)).to.be.true;
		});
	});

	describe('#normalizeRange', function() {
		it('should return a range of timestamps for a given range Date instance', function() {
			let time = Date.now();
			let range = [ new Date(time), new Date(time + 10) ];
			let normalizedRange = this.time.normalizeRange(range);
			expect(normalizedRange).to.be.an('array');
			expect(normalizedRange).to.have.length(2);
			expect(normalizedRange).to.include(time);
			expect(normalizedRange).to.include(time + 10);
		});

		it('should return a range of timestamps for a given range of date string', function() {
			let date1 = new Date();
			let date2 = new Date(date1.getTime() + 10);
			let range = [ date1.toISOString(), date2.toISOString() ];
			let normalizedRange = this.time.normalizeRange(range);
			expect(normalizedRange).to.be.an('array');
			expect(normalizedRange).to.have.length(2);
			expect(normalizedRange).to.include(date1.getTime());
			expect(normalizedRange).to.include(date2.getTime());
		});

		it('should return a range of timestamps for a given range of timestamps', function() {
			let time = Date.now();
			let range = [ time, time + 10 ];
			let normalizedRange = this.time.normalizeRange(range);
			expect(normalizedRange).to.be.an('array');
			expect(normalizedRange).to.have.length(2);
			expect(normalizedRange).to.include(time);
			expect(normalizedRange).to.include(time + 10);
		});
	});

	describe('#normalizePoint', function() {
		it('should return timestamp for a given Date instance', function() {
			let date = new Date();
			let normalizedPoint = this.time.normalizePoint(date);
			expect(normalizedPoint).to.equal(date.getTime());
		});

		it('should return timestamp for a given date string', function() {
			let date = new Date();
			let normalizedPoint = this.time.normalizePoint(date.toISOString());
			expect(normalizedPoint).to.equal(date.getTime());
		});

		it('should return timestamp for a given timestamp', function() {
			let date = new Date();
			let normalizedPoint = this.time.normalizePoint(date.getTime());
			expect(normalizedPoint).to.equal(date.getTime());
		});

	});

	describe('#getRangeTokens', function() {
		it('should return all tokens for valid range', function() {
			let begin = moment.utc('2016-01-02 03:05:00.000');
			let end = moment.utc('2016-01-02 03:06:00.000');
			let beginTime = begin.valueOf();
			let tokens = this.time.getRangeTokens([ begin, end ]);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include(`${beginTime}^60000`);

			begin = moment.utc('2016-01-02 03:00:00.000');
			end = moment.utc('2016-01-02 04:00:00.000');
			beginTime = begin.valueOf();
			tokens = this.time.getRangeTokens([ begin, end ]);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include(`${beginTime}^3600000`);

			begin = moment.utc('2016-01-02 00:00:00.000');
			end = moment.utc('2016-01-03 00:00:00.000');
			beginTime = begin.valueOf();
			tokens = this.time.getRangeTokens([ begin, end ]);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(1);
			expect(tokens).to.include(`${beginTime}^86400000`);

			begin = moment.utc('2016-01-02 01:02:03.000');
			end = moment.utc('2016-01-02 02:01:03.000');
			tokens = this.time.getRangeTokens([ begin, end ]);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(118);
			let firstMinute = moment.utc('2016-01-02 01:03:00.000');
			let lastSecond = moment.utc('2016-01-02 02:01:02.000');
			beginTime = begin.valueOf();
			expect(tokens).to.include(`${firstMinute.valueOf()}^60000`);
			expect(tokens).to.include(`${beginTime}^1000`);
			expect(tokens).to.include(`${lastSecond.valueOf()}^1000`);
		});
	});

	describe('#getTokensForPoint', function() {
		it('should return all tokens for a valid point', function() {
			let time = moment.utc('2016-01-02 00:00:00.000');
			let tokens = this.time.getTokensForPoint(time);
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include(`${time.valueOf()}^1000`);
			expect(tokens).to.include(`${time.valueOf()}^60000`);
			expect(tokens).to.include(`${time.valueOf()}^3600000`);
			expect(tokens).to.include(`${time.valueOf()}^86400000`);

			time = moment.utc('2016-01-02 13:30:32.379');
			tokens = this.time.getTokensForPoint(time);
			let beginSecond = moment.utc('2016-01-02 13:30:32.000');
			let beginMinute = moment.utc('2016-01-02 13:30:00.000');
			let beginHour = moment.utc('2016-01-02 13:00:00.000');
			let beginDay = moment.utc('2016-01-02 00:00:00.000');
			expect(tokens).to.be.an('array');
			expect(tokens).to.have.length(4);
			expect(tokens).to.include(`${beginSecond}^1000`);
			expect(tokens).to.include(`${beginMinute}^60000`);
			expect(tokens).to.include(`${beginHour}^3600000`);
			expect(tokens).to.include(`${beginDay}^86400000`);
		});

		it('should return tokens that insect with range tokens', function() {
			let point = moment.utc('2016-01-02 00:05:04.000');
			let range = [ moment.utc('2016-01-02 00:00:00.000'), moment.utc('2016-01-02 01:00:00.000') ];
			let rangeTokens = this.time.getRangeTokens(range);
			let pointTokens = this.time.getTokensForPoint(point);
			expect(rangeTokens).to.be.an('array');
			expect(pointTokens).to.be.an('array');
			expect(rangeTokens).to.have.length.above(0);
			expect(pointTokens).to.have.length.above(0);
			expect(_.intersection(rangeTokens, pointTokens)).to.have.length.above(0);
		});
	});
});
