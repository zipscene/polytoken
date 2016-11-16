// Copyright 2016 Zipscene, LLC
// Licensed under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

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
