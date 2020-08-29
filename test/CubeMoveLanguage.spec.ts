import { CubeMoveLanguage } from "../src/CubeMoveLanguage";
import { CubeMove, CubeSpecification } from "../src/Cube";

//TODO: Multimoves

let s = new CubeSpecification(3);

test('Single Face Move Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, 'F')).toEqual([new CubeMove(s, 0, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, 'R')).toEqual([new CubeMove(s, 1, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, 'U')).toEqual([new CubeMove(s, 2, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, 'B')).toEqual([new CubeMove(s, 3, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, 'L')).toEqual([new CubeMove(s, 4, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, 'D')).toEqual([new CubeMove(s, 5, 1, 1)]);

	expect(CubeMoveLanguage.parse(s, 'F2')).toEqual([new CubeMove(s, 0, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, 'R2')).toEqual([new CubeMove(s, 1, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, 'U2')).toEqual([new CubeMove(s, 2, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, 'B2')).toEqual([new CubeMove(s, 3, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, 'L2')).toEqual([new CubeMove(s, 4, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, 'D2')).toEqual([new CubeMove(s, 5, 1, 2)]);

	expect(CubeMoveLanguage.parse(s, 'F\'')).toEqual([new CubeMove(s, 0, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, 'R\'')).toEqual([new CubeMove(s, 1, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, 'U\'')).toEqual([new CubeMove(s, 2, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, 'B\'')).toEqual([new CubeMove(s, 3, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, 'L\'')).toEqual([new CubeMove(s, 4, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, 'D\'')).toEqual([new CubeMove(s, 5, 1, -1)]);

});

test('Single Outer Block Move (default slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, 'Fw')).toEqual([new CubeMove(s, 0, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, 'Rw')).toEqual([new CubeMove(s, 1, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, 'Uw')).toEqual([new CubeMove(s, 2, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, 'Bw')).toEqual([new CubeMove(s, 3, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, 'Lw')).toEqual([new CubeMove(s, 4, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, 'Dw')).toEqual([new CubeMove(s, 5, 2, 1)]);

	expect(CubeMoveLanguage.parse(s, 'Fw2')).toEqual([new CubeMove(s, 0, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, 'Rw2')).toEqual([new CubeMove(s, 1, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, 'Uw2')).toEqual([new CubeMove(s, 2, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, 'Bw2')).toEqual([new CubeMove(s, 3, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, 'Lw2')).toEqual([new CubeMove(s, 4, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, 'Dw2')).toEqual([new CubeMove(s, 5, 2, 2)]);

	expect(CubeMoveLanguage.parse(s, 'Fw\'')).toEqual([new CubeMove(s, 0, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, 'Rw\'')).toEqual([new CubeMove(s, 1, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, 'Uw\'')).toEqual([new CubeMove(s, 2, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, 'Bw\'')).toEqual([new CubeMove(s, 3, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, 'Lw\'')).toEqual([new CubeMove(s, 4, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, 'Dw\'')).toEqual([new CubeMove(s, 5, 2, -1)]);

});

test('Single Outer Block Move (1 slice) Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, '1Fw')).toEqual([new CubeMove(s, 0, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, '1Rw')).toEqual([new CubeMove(s, 1, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, '1Uw')).toEqual([new CubeMove(s, 2, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, '1Bw')).toEqual([new CubeMove(s, 3, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, '1Lw')).toEqual([new CubeMove(s, 4, 1, 1)]);
	expect(CubeMoveLanguage.parse(s, '1Dw')).toEqual([new CubeMove(s, 5, 1, 1)]);

	expect(CubeMoveLanguage.parse(s, '1Fw2')).toEqual([new CubeMove(s, 0, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, '1Rw2')).toEqual([new CubeMove(s, 1, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, '1Uw2')).toEqual([new CubeMove(s, 2, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, '1Bw2')).toEqual([new CubeMove(s, 3, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, '1Lw2')).toEqual([new CubeMove(s, 4, 1, 2)]);
	expect(CubeMoveLanguage.parse(s, '1Dw2')).toEqual([new CubeMove(s, 5, 1, 2)]);

	expect(CubeMoveLanguage.parse(s, '1Fw\'')).toEqual([new CubeMove(s, 0, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, '1Rw\'')).toEqual([new CubeMove(s, 1, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, '1Uw\'')).toEqual([new CubeMove(s, 2, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, '1Bw\'')).toEqual([new CubeMove(s, 3, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, '1Lw\'')).toEqual([new CubeMove(s, 4, 1, -1)]);
	expect(CubeMoveLanguage.parse(s, '1Dw\'')).toEqual([new CubeMove(s, 5, 1, -1)]);

});

test('Single Outer Block Move (2 slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, '2Fw')).toEqual([new CubeMove(s, 0, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, '2Rw')).toEqual([new CubeMove(s, 1, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, '2Uw')).toEqual([new CubeMove(s, 2, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, '2Bw')).toEqual([new CubeMove(s, 3, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, '2Lw')).toEqual([new CubeMove(s, 4, 2, 1)]);
	expect(CubeMoveLanguage.parse(s, '2Dw')).toEqual([new CubeMove(s, 5, 2, 1)]);

	expect(CubeMoveLanguage.parse(s, '2Fw2')).toEqual([new CubeMove(s, 0, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, '2Rw2')).toEqual([new CubeMove(s, 1, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, '2Uw2')).toEqual([new CubeMove(s, 2, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, '2Bw2')).toEqual([new CubeMove(s, 3, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, '2Lw2')).toEqual([new CubeMove(s, 4, 2, 2)]);
	expect(CubeMoveLanguage.parse(s, '2Dw2')).toEqual([new CubeMove(s, 5, 2, 2)]);

	expect(CubeMoveLanguage.parse(s, '2Fw\'')).toEqual([new CubeMove(s, 0, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, '2Rw\'')).toEqual([new CubeMove(s, 1, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, '2Uw\'')).toEqual([new CubeMove(s, 2, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, '2Bw\'')).toEqual([new CubeMove(s, 3, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, '2Lw\'')).toEqual([new CubeMove(s, 4, 2, -1)]);
	expect(CubeMoveLanguage.parse(s, '2Dw\'')).toEqual([new CubeMove(s, 5, 2, -1)]);

});

test('Single Outer Block Move (6 slices) Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, '6Fw')).toEqual([new CubeMove(s, 0, 6, 1)]);
	expect(CubeMoveLanguage.parse(s, '6Rw')).toEqual([new CubeMove(s, 1, 6, 1)]);
	expect(CubeMoveLanguage.parse(s, '6Uw')).toEqual([new CubeMove(s, 2, 6, 1)]);
	expect(CubeMoveLanguage.parse(s, '6Bw')).toEqual([new CubeMove(s, 3, 6, 1)]);
	expect(CubeMoveLanguage.parse(s, '6Lw')).toEqual([new CubeMove(s, 4, 6, 1)]);
	expect(CubeMoveLanguage.parse(s, '6Dw')).toEqual([new CubeMove(s, 5, 6, 1)]);

	expect(CubeMoveLanguage.parse(s, '6Fw2')).toEqual([new CubeMove(s, 0, 6, 2)]);
	expect(CubeMoveLanguage.parse(s, '6Rw2')).toEqual([new CubeMove(s, 1, 6, 2)]);
	expect(CubeMoveLanguage.parse(s, '6Uw2')).toEqual([new CubeMove(s, 2, 6, 2)]);
	expect(CubeMoveLanguage.parse(s, '6Bw2')).toEqual([new CubeMove(s, 3, 6, 2)]);
	expect(CubeMoveLanguage.parse(s, '6Lw2')).toEqual([new CubeMove(s, 4, 6, 2)]);
	expect(CubeMoveLanguage.parse(s, '6Dw2')).toEqual([new CubeMove(s, 5, 6, 2)]);

	expect(CubeMoveLanguage.parse(s, '6Fw\'')).toEqual([new CubeMove(s, 0, 6, -1)]);
	expect(CubeMoveLanguage.parse(s, '6Rw\'')).toEqual([new CubeMove(s, 1, 6, -1)]);
	expect(CubeMoveLanguage.parse(s, '6Uw\'')).toEqual([new CubeMove(s, 2, 6, -1)]);
	expect(CubeMoveLanguage.parse(s, '6Bw\'')).toEqual([new CubeMove(s, 3, 6, -1)]);
	expect(CubeMoveLanguage.parse(s, '6Lw\'')).toEqual([new CubeMove(s, 4, 6, -1)]);
	expect(CubeMoveLanguage.parse(s, '6Dw\'')).toEqual([new CubeMove(s, 5, 6, -1)]);

});

test('Single Rotation Move Parse Test', () => {

	expect(CubeMoveLanguage.parse(s, 'z')).toEqual([new CubeMove(s, 0, 3, 1)]);
	expect(CubeMoveLanguage.parse(s, 'x')).toEqual([new CubeMove(s, 1, 3, 1)]);
	expect(CubeMoveLanguage.parse(s, 'y')).toEqual([new CubeMove(s, 2, 3, 1)]);

	expect(CubeMoveLanguage.parse(s, 'z2')).toEqual([new CubeMove(s, 0, 3, 2)]);
	expect(CubeMoveLanguage.parse(s, 'x2')).toEqual([new CubeMove(s, 1, 3, 2)]);
	expect(CubeMoveLanguage.parse(s, 'y2')).toEqual([new CubeMove(s, 2, 3, 2)]);

	expect(CubeMoveLanguage.parse(s, 'z\'')).toEqual([new CubeMove(s, 0, 3, -1)]);
	expect(CubeMoveLanguage.parse(s, 'x\'')).toEqual([new CubeMove(s, 1, 3, -1)]);
	expect(CubeMoveLanguage.parse(s, 'y\'')).toEqual([new CubeMove(s, 2, 3, -1)]);

});

test('Single Face Move Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 1, 1)])).toEqual('F');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 1, 1)])).toEqual('R');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 1, 1)])).toEqual('U');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 1, 1)])).toEqual('B');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 1, 1)])).toEqual('L');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 1, 1)])).toEqual('D');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 1, 2)])).toEqual('F2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 1, 2)])).toEqual('R2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 1, 2)])).toEqual('U2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 1, 2)])).toEqual('B2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 1, 2)])).toEqual('L2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 1, 2)])).toEqual('D2');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 1, -1)])).toEqual('F\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 1, -1)])).toEqual('R\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 1, -1)])).toEqual('U\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 1, -1)])).toEqual('B\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 1, -1)])).toEqual('L\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 1, -1)])).toEqual('D\'');

});

test('Single Outer Block Move (2 slice) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 2, 1)])).toEqual('Fw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 2, 1)])).toEqual('Rw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 2, 1)])).toEqual('Uw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 2, 1)])).toEqual('Bw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 2, 1)])).toEqual('Lw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 2, 1)])).toEqual('Dw');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 2, 2)])).toEqual('Fw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 2, 2)])).toEqual('Rw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 2, 2)])).toEqual('Uw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 2, 2)])).toEqual('Bw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 2, 2)])).toEqual('Lw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 2, 2)])).toEqual('Dw2');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 2, -1)])).toEqual('Fw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 2, -1)])).toEqual('Rw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 2, -1)])).toEqual('Uw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 2, -1)])).toEqual('Bw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 2, -1)])).toEqual('Lw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 2, -1)])).toEqual('Dw\'');

});

test('Single Outer Block Move (3 slice, Quadrocube) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, 1)], 4)).toEqual('3Fw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, 1)], 4)).toEqual('3Rw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, 1)], 4)).toEqual('3Uw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, 1)], 4)).toEqual('3Bw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, 1)], 4)).toEqual('3Lw');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, 1)], 4)).toEqual('3Dw');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, 2)], 4)).toEqual('3Fw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, 2)], 4)).toEqual('3Rw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, 2)], 4)).toEqual('3Uw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, 2)], 4)).toEqual('3Bw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, 2)], 4)).toEqual('3Lw2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, 2)], 4)).toEqual('3Dw2');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, -1)], 4)).toEqual('3Fw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, -1)], 4)).toEqual('3Rw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, -1)], 4)).toEqual('3Uw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, -1)], 4)).toEqual('3Bw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, -1)], 4)).toEqual('3Lw\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, -1)], 4)).toEqual('3Dw\'');

});

test('Single Rotation Move (3 slice) Stringify Test', () => {

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, 1)])).toEqual('z');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, 1)])).toEqual('x');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, 1)])).toEqual('y');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, 1)])).toEqual('z\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, 1)])).toEqual('x\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, 1)])).toEqual('y\'');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, 2)])).toEqual('z2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, 2)])).toEqual('x2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, 2)])).toEqual('y2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, 2)])).toEqual('z2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, 2)])).toEqual('x2');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, 2)])).toEqual('y2');

	expect(CubeMoveLanguage.stringify([new CubeMove(s, 0, 3, -1)])).toEqual('z\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 1, 3, -1)])).toEqual('x\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 2, 3, -1)])).toEqual('y\'');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 3, 3, -1)])).toEqual('z');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 4, 3, -1)])).toEqual('x');
	expect(CubeMoveLanguage.stringify([new CubeMove(s, 5, 3, -1)])).toEqual('y');

});