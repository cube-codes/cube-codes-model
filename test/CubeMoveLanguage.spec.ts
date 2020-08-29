import { CubeMoveLanguage } from "../src/CubeMoveLanguage";
import { CubeMove, CubeSpecification } from "../src/Cube";

//TODO: Multimoves

let s3 = new CubeSpecification(3);
let s8 = new CubeSpecification(8);
let cml3 = new CubeMoveLanguage(s3);
let cml8 = new CubeMoveLanguage(s8);

test('Single Face Move Parse Test', () => {

	expect(cml3.parse('F')).toEqual([new CubeMove(s3, 0, 1, 1)]);
	expect(cml3.parse('R')).toEqual([new CubeMove(s3, 1, 1, 1)]);
	expect(cml3.parse('U')).toEqual([new CubeMove(s3, 2, 1, 1)]);
	expect(cml3.parse('B')).toEqual([new CubeMove(s3, 3, 1, 1)]);
	expect(cml3.parse('L')).toEqual([new CubeMove(s3, 4, 1, 1)]);
	expect(cml3.parse('D')).toEqual([new CubeMove(s3, 5, 1, 1)]);

	expect(cml3.parse('F2')).toEqual([new CubeMove(s3, 0, 1, 2)]);
	expect(cml3.parse('R2')).toEqual([new CubeMove(s3, 1, 1, 2)]);
	expect(cml3.parse('U2')).toEqual([new CubeMove(s3, 2, 1, 2)]);
	expect(cml3.parse('B2')).toEqual([new CubeMove(s3, 3, 1, 2)]);
	expect(cml3.parse('L2')).toEqual([new CubeMove(s3, 4, 1, 2)]);
	expect(cml3.parse('D2')).toEqual([new CubeMove(s3, 5, 1, 2)]);

	expect(cml3.parse('F\'')).toEqual([new CubeMove(s3, 0, 1, -1)]);
	expect(cml3.parse('R\'')).toEqual([new CubeMove(s3, 1, 1, -1)]);
	expect(cml3.parse('U\'')).toEqual([new CubeMove(s3, 2, 1, -1)]);
	expect(cml3.parse('B\'')).toEqual([new CubeMove(s3, 3, 1, -1)]);
	expect(cml3.parse('L\'')).toEqual([new CubeMove(s3, 4, 1, -1)]);
	expect(cml3.parse('D\'')).toEqual([new CubeMove(s3, 5, 1, -1)]);

});

test('Single Outer Block Move (default slices) Parse Test', () => {

	expect(cml3.parse('Fw')).toEqual([new CubeMove(s3, 0, 2, 1)]);
	expect(cml3.parse('Rw')).toEqual([new CubeMove(s3, 1, 2, 1)]);
	expect(cml3.parse('Uw')).toEqual([new CubeMove(s3, 2, 2, 1)]);
	expect(cml3.parse('Bw')).toEqual([new CubeMove(s3, 3, 2, 1)]);
	expect(cml3.parse('Lw')).toEqual([new CubeMove(s3, 4, 2, 1)]);
	expect(cml3.parse('Dw')).toEqual([new CubeMove(s3, 5, 2, 1)]);

	expect(cml3.parse('Fw2')).toEqual([new CubeMove(s3, 0, 2, 2)]);
	expect(cml3.parse('Rw2')).toEqual([new CubeMove(s3, 1, 2, 2)]);
	expect(cml3.parse('Uw2')).toEqual([new CubeMove(s3, 2, 2, 2)]);
	expect(cml3.parse('Bw2')).toEqual([new CubeMove(s3, 3, 2, 2)]);
	expect(cml3.parse('Lw2')).toEqual([new CubeMove(s3, 4, 2, 2)]);
	expect(cml3.parse('Dw2')).toEqual([new CubeMove(s3, 5, 2, 2)]);

	expect(cml3.parse('Fw\'')).toEqual([new CubeMove(s3, 0, 2, -1)]);
	expect(cml3.parse('Rw\'')).toEqual([new CubeMove(s3, 1, 2, -1)]);
	expect(cml3.parse('Uw\'')).toEqual([new CubeMove(s3, 2, 2, -1)]);
	expect(cml3.parse('Bw\'')).toEqual([new CubeMove(s3, 3, 2, -1)]);
	expect(cml3.parse('Lw\'')).toEqual([new CubeMove(s3, 4, 2, -1)]);
	expect(cml3.parse('Dw\'')).toEqual([new CubeMove(s3, 5, 2, -1)]);

});

test('Single Outer Block Move (1 slice) Parse Test', () => {

	expect(cml3.parse('1Fw')).toEqual([new CubeMove(s3, 0, 1, 1)]);
	expect(cml3.parse('1Rw')).toEqual([new CubeMove(s3, 1, 1, 1)]);
	expect(cml3.parse('1Uw')).toEqual([new CubeMove(s3, 2, 1, 1)]);
	expect(cml3.parse('1Bw')).toEqual([new CubeMove(s3, 3, 1, 1)]);
	expect(cml3.parse('1Lw')).toEqual([new CubeMove(s3, 4, 1, 1)]);
	expect(cml3.parse('1Dw')).toEqual([new CubeMove(s3, 5, 1, 1)]);

	expect(cml3.parse('1Fw2')).toEqual([new CubeMove(s3, 0, 1, 2)]);
	expect(cml3.parse('1Rw2')).toEqual([new CubeMove(s3, 1, 1, 2)]);
	expect(cml3.parse('1Uw2')).toEqual([new CubeMove(s3, 2, 1, 2)]);
	expect(cml3.parse('1Bw2')).toEqual([new CubeMove(s3, 3, 1, 2)]);
	expect(cml3.parse('1Lw2')).toEqual([new CubeMove(s3, 4, 1, 2)]);
	expect(cml3.parse('1Dw2')).toEqual([new CubeMove(s3, 5, 1, 2)]);

	expect(cml3.parse('1Fw\'')).toEqual([new CubeMove(s3, 0, 1, -1)]);
	expect(cml3.parse('1Rw\'')).toEqual([new CubeMove(s3, 1, 1, -1)]);
	expect(cml3.parse('1Uw\'')).toEqual([new CubeMove(s3, 2, 1, -1)]);
	expect(cml3.parse('1Bw\'')).toEqual([new CubeMove(s3, 3, 1, -1)]);
	expect(cml3.parse('1Lw\'')).toEqual([new CubeMove(s3, 4, 1, -1)]);
	expect(cml3.parse('1Dw\'')).toEqual([new CubeMove(s3, 5, 1, -1)]);

});

test('Single Outer Block Move (2 slices) Parse Test', () => {

	expect(cml3.parse('2Fw')).toEqual([new CubeMove(s3, 0, 2, 1)]);
	expect(cml3.parse('2Rw')).toEqual([new CubeMove(s3, 1, 2, 1)]);
	expect(cml3.parse('2Uw')).toEqual([new CubeMove(s3, 2, 2, 1)]);
	expect(cml3.parse('2Bw')).toEqual([new CubeMove(s3, 3, 2, 1)]);
	expect(cml3.parse('2Lw')).toEqual([new CubeMove(s3, 4, 2, 1)]);
	expect(cml3.parse('2Dw')).toEqual([new CubeMove(s3, 5, 2, 1)]);

	expect(cml3.parse('2Fw2')).toEqual([new CubeMove(s3, 0, 2, 2)]);
	expect(cml3.parse('2Rw2')).toEqual([new CubeMove(s3, 1, 2, 2)]);
	expect(cml3.parse('2Uw2')).toEqual([new CubeMove(s3, 2, 2, 2)]);
	expect(cml3.parse('2Bw2')).toEqual([new CubeMove(s3, 3, 2, 2)]);
	expect(cml3.parse('2Lw2')).toEqual([new CubeMove(s3, 4, 2, 2)]);
	expect(cml3.parse('2Dw2')).toEqual([new CubeMove(s3, 5, 2, 2)]);

	expect(cml3.parse('2Fw\'')).toEqual([new CubeMove(s3, 0, 2, -1)]);
	expect(cml3.parse('2Rw\'')).toEqual([new CubeMove(s3, 1, 2, -1)]);
	expect(cml3.parse('2Uw\'')).toEqual([new CubeMove(s3, 2, 2, -1)]);
	expect(cml3.parse('2Bw\'')).toEqual([new CubeMove(s3, 3, 2, -1)]);
	expect(cml3.parse('2Lw\'')).toEqual([new CubeMove(s3, 4, 2, -1)]);
	expect(cml3.parse('2Dw\'')).toEqual([new CubeMove(s3, 5, 2, -1)]);

});

test('Single Outer Block Move (6 slices, Octocube) Parse Test', () => {

	expect(cml8.parse('6Fw')).toEqual([new CubeMove(s8, 0, 6, 1)]);
	expect(cml8.parse('6Rw')).toEqual([new CubeMove(s8, 1, 6, 1)]);
	expect(cml8.parse('6Uw')).toEqual([new CubeMove(s8, 2, 6, 1)]);
	expect(cml8.parse('6Bw')).toEqual([new CubeMove(s8, 3, 6, 1)]);
	expect(cml8.parse('6Lw')).toEqual([new CubeMove(s8, 4, 6, 1)]);
	expect(cml8.parse('6Dw')).toEqual([new CubeMove(s8, 5, 6, 1)]);

	expect(cml8.parse('6Fw2')).toEqual([new CubeMove(s8, 0, 6, 2)]);
	expect(cml8.parse('6Rw2')).toEqual([new CubeMove(s8, 1, 6, 2)]);
	expect(cml8.parse('6Uw2')).toEqual([new CubeMove(s8, 2, 6, 2)]);
	expect(cml8.parse('6Bw2')).toEqual([new CubeMove(s8, 3, 6, 2)]);
	expect(cml8.parse('6Lw2')).toEqual([new CubeMove(s8, 4, 6, 2)]);
	expect(cml8.parse('6Dw2')).toEqual([new CubeMove(s8, 5, 6, 2)]);

	expect(cml8.parse('6Fw\'')).toEqual([new CubeMove(s8, 0, 6, -1)]);
	expect(cml8.parse('6Rw\'')).toEqual([new CubeMove(s8, 1, 6, -1)]);
	expect(cml8.parse('6Uw\'')).toEqual([new CubeMove(s8, 2, 6, -1)]);
	expect(cml8.parse('6Bw\'')).toEqual([new CubeMove(s8, 3, 6, -1)]);
	expect(cml8.parse('6Lw\'')).toEqual([new CubeMove(s8, 4, 6, -1)]);
	expect(cml8.parse('6Dw\'')).toEqual([new CubeMove(s8, 5, 6, -1)]);

});

test('Single Rotation Move Parse Test', () => {

	expect(cml3.parse('z')).toEqual([new CubeMove(s3, 0, 3, 1)]);
	expect(cml3.parse('x')).toEqual([new CubeMove(s3, 1, 3, 1)]);
	expect(cml3.parse('y')).toEqual([new CubeMove(s3, 2, 3, 1)]);

	expect(cml3.parse('z2')).toEqual([new CubeMove(s3, 0, 3, 2)]);
	expect(cml3.parse('x2')).toEqual([new CubeMove(s3, 1, 3, 2)]);
	expect(cml3.parse('y2')).toEqual([new CubeMove(s3, 2, 3, 2)]);

	expect(cml3.parse('z\'')).toEqual([new CubeMove(s3, 0, 3, -1)]);
	expect(cml3.parse('x\'')).toEqual([new CubeMove(s3, 1, 3, -1)]);
	expect(cml3.parse('y\'')).toEqual([new CubeMove(s3, 2, 3, -1)]);

});

test('Single Face Move Stringify Test', () => {

	expect(cml3.stringify([new CubeMove(s3, 0, 1, 1)])).toEqual('F');
	expect(cml3.stringify([new CubeMove(s3, 1, 1, 1)])).toEqual('R');
	expect(cml3.stringify([new CubeMove(s3, 2, 1, 1)])).toEqual('U');
	expect(cml3.stringify([new CubeMove(s3, 3, 1, 1)])).toEqual('B');
	expect(cml3.stringify([new CubeMove(s3, 4, 1, 1)])).toEqual('L');
	expect(cml3.stringify([new CubeMove(s3, 5, 1, 1)])).toEqual('D');

	expect(cml3.stringify([new CubeMove(s3, 0, 1, 2)])).toEqual('F2');
	expect(cml3.stringify([new CubeMove(s3, 1, 1, 2)])).toEqual('R2');
	expect(cml3.stringify([new CubeMove(s3, 2, 1, 2)])).toEqual('U2');
	expect(cml3.stringify([new CubeMove(s3, 3, 1, 2)])).toEqual('B2');
	expect(cml3.stringify([new CubeMove(s3, 4, 1, 2)])).toEqual('L2');
	expect(cml3.stringify([new CubeMove(s3, 5, 1, 2)])).toEqual('D2');

	expect(cml3.stringify([new CubeMove(s3, 0, 1, -1)])).toEqual('F\'');
	expect(cml3.stringify([new CubeMove(s3, 1, 1, -1)])).toEqual('R\'');
	expect(cml3.stringify([new CubeMove(s3, 2, 1, -1)])).toEqual('U\'');
	expect(cml3.stringify([new CubeMove(s3, 3, 1, -1)])).toEqual('B\'');
	expect(cml3.stringify([new CubeMove(s3, 4, 1, -1)])).toEqual('L\'');
	expect(cml3.stringify([new CubeMove(s3, 5, 1, -1)])).toEqual('D\'');

});

test('Single Outer Block Move (2 slice) Stringify Test', () => {

	expect(cml3.stringify([new CubeMove(s3, 0, 2, 1)])).toEqual('Fw');
	expect(cml3.stringify([new CubeMove(s3, 1, 2, 1)])).toEqual('Rw');
	expect(cml3.stringify([new CubeMove(s3, 2, 2, 1)])).toEqual('Uw');
	expect(cml3.stringify([new CubeMove(s3, 3, 2, 1)])).toEqual('Bw');
	expect(cml3.stringify([new CubeMove(s3, 4, 2, 1)])).toEqual('Lw');
	expect(cml3.stringify([new CubeMove(s3, 5, 2, 1)])).toEqual('Dw');

	expect(cml3.stringify([new CubeMove(s3, 0, 2, 2)])).toEqual('Fw2');
	expect(cml3.stringify([new CubeMove(s3, 1, 2, 2)])).toEqual('Rw2');
	expect(cml3.stringify([new CubeMove(s3, 2, 2, 2)])).toEqual('Uw2');
	expect(cml3.stringify([new CubeMove(s3, 3, 2, 2)])).toEqual('Bw2');
	expect(cml3.stringify([new CubeMove(s3, 4, 2, 2)])).toEqual('Lw2');
	expect(cml3.stringify([new CubeMove(s3, 5, 2, 2)])).toEqual('Dw2');

	expect(cml3.stringify([new CubeMove(s3, 0, 2, -1)])).toEqual('Fw\'');
	expect(cml3.stringify([new CubeMove(s3, 1, 2, -1)])).toEqual('Rw\'');
	expect(cml3.stringify([new CubeMove(s3, 2, 2, -1)])).toEqual('Uw\'');
	expect(cml3.stringify([new CubeMove(s3, 3, 2, -1)])).toEqual('Bw\'');
	expect(cml3.stringify([new CubeMove(s3, 4, 2, -1)])).toEqual('Lw\'');
	expect(cml3.stringify([new CubeMove(s3, 5, 2, -1)])).toEqual('Dw\'');

});

test('Single Outer Block Move (3 slice, Quadrocube) Stringify Test', () => {

	expect(cml8.stringify([new CubeMove(s8, 0, 3, 1)])).toEqual('3Fw');
	expect(cml8.stringify([new CubeMove(s8, 1, 3, 1)])).toEqual('3Rw');
	expect(cml8.stringify([new CubeMove(s8, 2, 3, 1)])).toEqual('3Uw');
	expect(cml8.stringify([new CubeMove(s8, 3, 3, 1)])).toEqual('3Bw');
	expect(cml8.stringify([new CubeMove(s8, 4, 3, 1)])).toEqual('3Lw');
	expect(cml8.stringify([new CubeMove(s8, 5, 3, 1)])).toEqual('3Dw');

	expect(cml8.stringify([new CubeMove(s8, 0, 3, 2)])).toEqual('3Fw2');
	expect(cml8.stringify([new CubeMove(s8, 1, 3, 2)])).toEqual('3Rw2');
	expect(cml8.stringify([new CubeMove(s8, 2, 3, 2)])).toEqual('3Uw2');
	expect(cml8.stringify([new CubeMove(s8, 3, 3, 2)])).toEqual('3Bw2');
	expect(cml8.stringify([new CubeMove(s8, 4, 3, 2)])).toEqual('3Lw2');
	expect(cml8.stringify([new CubeMove(s8, 5, 3, 2)])).toEqual('3Dw2');

	expect(cml8.stringify([new CubeMove(s8, 0, 3, -1)])).toEqual('3Fw\'');
	expect(cml8.stringify([new CubeMove(s8, 1, 3, -1)])).toEqual('3Rw\'');
	expect(cml8.stringify([new CubeMove(s8, 2, 3, -1)])).toEqual('3Uw\'');
	expect(cml8.stringify([new CubeMove(s8, 3, 3, -1)])).toEqual('3Bw\'');
	expect(cml8.stringify([new CubeMove(s8, 4, 3, -1)])).toEqual('3Lw\'');
	expect(cml8.stringify([new CubeMove(s8, 5, 3, -1)])).toEqual('3Dw\'');

});

test('Single Rotation Move (3 slice) Stringify Test', () => {

	expect(cml3.stringify([new CubeMove(s3, 0, 3, 1)])).toEqual('z');
	expect(cml3.stringify([new CubeMove(s3, 1, 3, 1)])).toEqual('x');
	expect(cml3.stringify([new CubeMove(s3, 2, 3, 1)])).toEqual('y');
	expect(cml3.stringify([new CubeMove(s3, 3, 3, 1)])).toEqual('z\'');
	expect(cml3.stringify([new CubeMove(s3, 4, 3, 1)])).toEqual('x\'');
	expect(cml3.stringify([new CubeMove(s3, 5, 3, 1)])).toEqual('y\'');

	expect(cml3.stringify([new CubeMove(s3, 0, 3, 2)])).toEqual('z2');
	expect(cml3.stringify([new CubeMove(s3, 1, 3, 2)])).toEqual('x2');
	expect(cml3.stringify([new CubeMove(s3, 2, 3, 2)])).toEqual('y2');
	expect(cml3.stringify([new CubeMove(s3, 3, 3, 2)])).toEqual('z2');
	expect(cml3.stringify([new CubeMove(s3, 4, 3, 2)])).toEqual('x2');
	expect(cml3.stringify([new CubeMove(s3, 5, 3, 2)])).toEqual('y2');

	expect(cml3.stringify([new CubeMove(s3, 0, 3, -1)])).toEqual('z\'');
	expect(cml3.stringify([new CubeMove(s3, 1, 3, -1)])).toEqual('x\'');
	expect(cml3.stringify([new CubeMove(s3, 2, 3, -1)])).toEqual('y\'');
	expect(cml3.stringify([new CubeMove(s3, 3, 3, -1)])).toEqual('z');
	expect(cml3.stringify([new CubeMove(s3, 4, 3, -1)])).toEqual('x');
	expect(cml3.stringify([new CubeMove(s3, 5, 3, -1)])).toEqual('y');

});