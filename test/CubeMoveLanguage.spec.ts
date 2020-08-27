import { CubeMoveLanguage } from "../src/CubeMoveLanguage";
import { CubeMove } from "../src/Cube";

//TODO: Multimoves

test('Single Face Move Parse Test', () => {

	expect(CubeMoveLanguage.parse('F')).toEqual([new CubeMove(0, 1, 1)]);
	expect(CubeMoveLanguage.parse('R')).toEqual([new CubeMove(1, 1, 1)]);
	expect(CubeMoveLanguage.parse('U')).toEqual([new CubeMove(2, 1, 1)]);
	expect(CubeMoveLanguage.parse('B')).toEqual([new CubeMove(3, 1, 1)]);
	expect(CubeMoveLanguage.parse('L')).toEqual([new CubeMove(4, 1, 1)]);
	expect(CubeMoveLanguage.parse('D')).toEqual([new CubeMove(5, 1, 1)]);

	expect(CubeMoveLanguage.parse('F2')).toEqual([new CubeMove(0, 1, 2)]);
	expect(CubeMoveLanguage.parse('R2')).toEqual([new CubeMove(1, 1, 2)]);
	expect(CubeMoveLanguage.parse('U2')).toEqual([new CubeMove(2, 1, 2)]);
	expect(CubeMoveLanguage.parse('B2')).toEqual([new CubeMove(3, 1, 2)]);
	expect(CubeMoveLanguage.parse('L2')).toEqual([new CubeMove(4, 1, 2)]);
	expect(CubeMoveLanguage.parse('D2')).toEqual([new CubeMove(5, 1, 2)]);

	expect(CubeMoveLanguage.parse('F\'')).toEqual([new CubeMove(0, 1, -1)]);
	expect(CubeMoveLanguage.parse('R\'')).toEqual([new CubeMove(1, 1, -1)]);
	expect(CubeMoveLanguage.parse('U\'')).toEqual([new CubeMove(2, 1, -1)]);
	expect(CubeMoveLanguage.parse('B\'')).toEqual([new CubeMove(3, 1, -1)]);
	expect(CubeMoveLanguage.parse('L\'')).toEqual([new CubeMove(4, 1, -1)]);
	expect(CubeMoveLanguage.parse('D\'')).toEqual([new CubeMove(5, 1, -1)]);

});

test('Single Outer Block Move (default slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse('Fw')).toEqual([new CubeMove(0, 2, 1)]);
	expect(CubeMoveLanguage.parse('Rw')).toEqual([new CubeMove(1, 2, 1)]);
	expect(CubeMoveLanguage.parse('Uw')).toEqual([new CubeMove(2, 2, 1)]);
	expect(CubeMoveLanguage.parse('Bw')).toEqual([new CubeMove(3, 2, 1)]);
	expect(CubeMoveLanguage.parse('Lw')).toEqual([new CubeMove(4, 2, 1)]);
	expect(CubeMoveLanguage.parse('Dw')).toEqual([new CubeMove(5, 2, 1)]);

	expect(CubeMoveLanguage.parse('Fw2')).toEqual([new CubeMove(0, 2, 2)]);
	expect(CubeMoveLanguage.parse('Rw2')).toEqual([new CubeMove(1, 2, 2)]);
	expect(CubeMoveLanguage.parse('Uw2')).toEqual([new CubeMove(2, 2, 2)]);
	expect(CubeMoveLanguage.parse('Bw2')).toEqual([new CubeMove(3, 2, 2)]);
	expect(CubeMoveLanguage.parse('Lw2')).toEqual([new CubeMove(4, 2, 2)]);
	expect(CubeMoveLanguage.parse('Dw2')).toEqual([new CubeMove(5, 2, 2)]);

	expect(CubeMoveLanguage.parse('Fw\'')).toEqual([new CubeMove(0, 2, -1)]);
	expect(CubeMoveLanguage.parse('Rw\'')).toEqual([new CubeMove(1, 2, -1)]);
	expect(CubeMoveLanguage.parse('Uw\'')).toEqual([new CubeMove(2, 2, -1)]);
	expect(CubeMoveLanguage.parse('Bw\'')).toEqual([new CubeMove(3, 2, -1)]);
	expect(CubeMoveLanguage.parse('Lw\'')).toEqual([new CubeMove(4, 2, -1)]);
	expect(CubeMoveLanguage.parse('Dw\'')).toEqual([new CubeMove(5, 2, -1)]);

});

test('Single Outer Block Move (1 slice) Parse Test', () => {

	expect(CubeMoveLanguage.parse('1Fw')).toEqual([new CubeMove(0, 1, 1)]);
	expect(CubeMoveLanguage.parse('1Rw')).toEqual([new CubeMove(1, 1, 1)]);
	expect(CubeMoveLanguage.parse('1Uw')).toEqual([new CubeMove(2, 1, 1)]);
	expect(CubeMoveLanguage.parse('1Bw')).toEqual([new CubeMove(3, 1, 1)]);
	expect(CubeMoveLanguage.parse('1Lw')).toEqual([new CubeMove(4, 1, 1)]);
	expect(CubeMoveLanguage.parse('1Dw')).toEqual([new CubeMove(5, 1, 1)]);

	expect(CubeMoveLanguage.parse('1Fw2')).toEqual([new CubeMove(0, 1, 2)]);
	expect(CubeMoveLanguage.parse('1Rw2')).toEqual([new CubeMove(1, 1, 2)]);
	expect(CubeMoveLanguage.parse('1Uw2')).toEqual([new CubeMove(2, 1, 2)]);
	expect(CubeMoveLanguage.parse('1Bw2')).toEqual([new CubeMove(3, 1, 2)]);
	expect(CubeMoveLanguage.parse('1Lw2')).toEqual([new CubeMove(4, 1, 2)]);
	expect(CubeMoveLanguage.parse('1Dw2')).toEqual([new CubeMove(5, 1, 2)]);

	expect(CubeMoveLanguage.parse('1Fw\'')).toEqual([new CubeMove(0, 1, -1)]);
	expect(CubeMoveLanguage.parse('1Rw\'')).toEqual([new CubeMove(1, 1, -1)]);
	expect(CubeMoveLanguage.parse('1Uw\'')).toEqual([new CubeMove(2, 1, -1)]);
	expect(CubeMoveLanguage.parse('1Bw\'')).toEqual([new CubeMove(3, 1, -1)]);
	expect(CubeMoveLanguage.parse('1Lw\'')).toEqual([new CubeMove(4, 1, -1)]);
	expect(CubeMoveLanguage.parse('1Dw\'')).toEqual([new CubeMove(5, 1, -1)]);

});

test('Single Outer Block Move (2 slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse('2Fw')).toEqual([new CubeMove(0, 2, 1)]);
	expect(CubeMoveLanguage.parse('2Rw')).toEqual([new CubeMove(1, 2, 1)]);
	expect(CubeMoveLanguage.parse('2Uw')).toEqual([new CubeMove(2, 2, 1)]);
	expect(CubeMoveLanguage.parse('2Bw')).toEqual([new CubeMove(3, 2, 1)]);
	expect(CubeMoveLanguage.parse('2Lw')).toEqual([new CubeMove(4, 2, 1)]);
	expect(CubeMoveLanguage.parse('2Dw')).toEqual([new CubeMove(5, 2, 1)]);

	expect(CubeMoveLanguage.parse('2Fw2')).toEqual([new CubeMove(0, 2, 2)]);
	expect(CubeMoveLanguage.parse('2Rw2')).toEqual([new CubeMove(1, 2, 2)]);
	expect(CubeMoveLanguage.parse('2Uw2')).toEqual([new CubeMove(2, 2, 2)]);
	expect(CubeMoveLanguage.parse('2Bw2')).toEqual([new CubeMove(3, 2, 2)]);
	expect(CubeMoveLanguage.parse('2Lw2')).toEqual([new CubeMove(4, 2, 2)]);
	expect(CubeMoveLanguage.parse('2Dw2')).toEqual([new CubeMove(5, 2, 2)]);

	expect(CubeMoveLanguage.parse('2Fw\'')).toEqual([new CubeMove(0, 2, -1)]);
	expect(CubeMoveLanguage.parse('2Rw\'')).toEqual([new CubeMove(1, 2, -1)]);
	expect(CubeMoveLanguage.parse('2Uw\'')).toEqual([new CubeMove(2, 2, -1)]);
	expect(CubeMoveLanguage.parse('2Bw\'')).toEqual([new CubeMove(3, 2, -1)]);
	expect(CubeMoveLanguage.parse('2Lw\'')).toEqual([new CubeMove(4, 2, -1)]);
	expect(CubeMoveLanguage.parse('2Dw\'')).toEqual([new CubeMove(5, 2, -1)]);

});

test('Single Outer Block Move (6 slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse('6Fw')).toEqual([new CubeMove(0, 6, 1)]);
	expect(CubeMoveLanguage.parse('6Rw')).toEqual([new CubeMove(1, 6, 1)]);
	expect(CubeMoveLanguage.parse('6Uw')).toEqual([new CubeMove(2, 6, 1)]);
	expect(CubeMoveLanguage.parse('6Bw')).toEqual([new CubeMove(3, 6, 1)]);
	expect(CubeMoveLanguage.parse('6Lw')).toEqual([new CubeMove(4, 6, 1)]);
	expect(CubeMoveLanguage.parse('6Dw')).toEqual([new CubeMove(5, 6, 1)]);

	expect(CubeMoveLanguage.parse('6Fw2')).toEqual([new CubeMove(0, 6, 2)]);
	expect(CubeMoveLanguage.parse('6Rw2')).toEqual([new CubeMove(1, 6, 2)]);
	expect(CubeMoveLanguage.parse('6Uw2')).toEqual([new CubeMove(2, 6, 2)]);
	expect(CubeMoveLanguage.parse('6Bw2')).toEqual([new CubeMove(3, 6, 2)]);
	expect(CubeMoveLanguage.parse('6Lw2')).toEqual([new CubeMove(4, 6, 2)]);
	expect(CubeMoveLanguage.parse('6Dw2')).toEqual([new CubeMove(5, 6, 2)]);

	expect(CubeMoveLanguage.parse('6Fw\'')).toEqual([new CubeMove(0, 6, -1)]);
	expect(CubeMoveLanguage.parse('6Rw\'')).toEqual([new CubeMove(1, 6, -1)]);
	expect(CubeMoveLanguage.parse('6Uw\'')).toEqual([new CubeMove(2, 6, -1)]);
	expect(CubeMoveLanguage.parse('6Bw\'')).toEqual([new CubeMove(3, 6, -1)]);
	expect(CubeMoveLanguage.parse('6Lw\'')).toEqual([new CubeMove(4, 6, -1)]);
	expect(CubeMoveLanguage.parse('6Dw\'')).toEqual([new CubeMove(5, 6, -1)]);

});

test('Single Rotation Move Parse Test', () => {

	expect(CubeMoveLanguage.parse('z')).toEqual([new CubeMove(0, 3, 1)]);
	expect(CubeMoveLanguage.parse('x')).toEqual([new CubeMove(1, 3, 1)]);
	expect(CubeMoveLanguage.parse('y')).toEqual([new CubeMove(2, 3, 1)]);

	expect(CubeMoveLanguage.parse('z2')).toEqual([new CubeMove(0, 3, 2)]);
	expect(CubeMoveLanguage.parse('x2')).toEqual([new CubeMove(1, 3, 2)]);
	expect(CubeMoveLanguage.parse('y2')).toEqual([new CubeMove(2, 3, 2)]);

	expect(CubeMoveLanguage.parse('z\'')).toEqual([new CubeMove(0, 3, -1)]);
	expect(CubeMoveLanguage.parse('x\'')).toEqual([new CubeMove(1, 3, -1)]);
	expect(CubeMoveLanguage.parse('y\'')).toEqual([new CubeMove(2, 3, -1)]);

});

test('Single Face Move Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 1, 1)])).toEqual('F');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 1, 1)])).toEqual('R');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 1, 1)])).toEqual('U');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 1, 1)])).toEqual('B');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 1, 1)])).toEqual('L');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 1, 1)])).toEqual('D');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 1, 2)])).toEqual('F2');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 1, 2)])).toEqual('R2');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 1, 2)])).toEqual('U2');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 1, 2)])).toEqual('B2');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 1, 2)])).toEqual('L2');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 1, 2)])).toEqual('D2');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 1, -1)])).toEqual('F\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 1, -1)])).toEqual('R\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 1, -1)])).toEqual('U\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 1, -1)])).toEqual('B\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 1, -1)])).toEqual('L\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 1, -1)])).toEqual('D\'');

});

test('Single Outer Block Move (2 slice) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 2, 1)])).toEqual('Fw');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 2, 1)])).toEqual('Rw');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 2, 1)])).toEqual('Uw');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 2, 1)])).toEqual('Bw');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 2, 1)])).toEqual('Lw');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 2, 1)])).toEqual('Dw');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 2, 2)])).toEqual('Fw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 2, 2)])).toEqual('Rw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 2, 2)])).toEqual('Uw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 2, 2)])).toEqual('Bw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 2, 2)])).toEqual('Lw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 2, 2)])).toEqual('Dw2');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 2, -1)])).toEqual('Fw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 2, -1)])).toEqual('Rw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 2, -1)])).toEqual('Uw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 2, -1)])).toEqual('Bw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 2, -1)])).toEqual('Lw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 2, -1)])).toEqual('Dw\'');

});

test('Single Outer Block Move (3 slice, Quadrocube) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, 1)], 4)).toEqual('3Fw');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, 1)], 4)).toEqual('3Rw');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, 1)], 4)).toEqual('3Uw');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, 1)], 4)).toEqual('3Bw');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, 1)], 4)).toEqual('3Lw');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, 1)], 4)).toEqual('3Dw');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, 2)], 4)).toEqual('3Fw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, 2)], 4)).toEqual('3Rw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, 2)], 4)).toEqual('3Uw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, 2)], 4)).toEqual('3Bw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, 2)], 4)).toEqual('3Lw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, 2)], 4)).toEqual('3Dw2');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, -1)], 4)).toEqual('3Fw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, -1)], 4)).toEqual('3Rw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, -1)], 4)).toEqual('3Uw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, -1)], 4)).toEqual('3Bw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, -1)], 4)).toEqual('3Lw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, -1)], 4)).toEqual('3Dw\'');

});

test('Single Rotation Move (3 slice) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, 1)])).toEqual('z');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, 1)])).toEqual('x');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, 1)])).toEqual('y');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, 1)])).toEqual('z\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, 1)])).toEqual('x\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, 1)])).toEqual('y\'');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, 2)])).toEqual('z2');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, 2)])).toEqual('x2');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, 2)])).toEqual('y2');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, 2)])).toEqual('z2');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, 2)])).toEqual('x2');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, 2)])).toEqual('y2');

	expect(CubeMoveLanguage.stringify([new CubeMove(0, 3, -1)])).toEqual('z\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(1, 3, -1)])).toEqual('x\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(2, 3, -1)])).toEqual('y\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(3, 3, -1)])).toEqual('z');
	expect(CubeMoveLanguage.stringify([new CubeMove(4, 3, -1)])).toEqual('x');
	expect(CubeMoveLanguage.stringify([new CubeMove(5, 3, -1)])).toEqual('y');

});