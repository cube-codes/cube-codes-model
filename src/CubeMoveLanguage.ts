import { CubeMove, CubeSpecification } from "./Cube";

export class CubeMoveLanguage {

	static parse(spec: CubeSpecification, movesString: string) {
		return movesString.split(/[^1-9FRUBLDw'xyz]+/).map(function (moveString) {

			let slices: number;
			let letterPosition: number;
			let hasSufffix: boolean;
			if (moveString.match(/^\d?[FRUBLD]w['2]?$/)) {
				slices = parseInt(moveString.substr(0, 1));
				letterPosition = 1;
				hasSufffix = moveString.length === 4;
				if (isNaN(slices)) {
					slices = 2;
					letterPosition = 0;
					hasSufffix = moveString.length === 3;
				}
			} else if (moveString.match(/^[FRUBLD]['2]?$/)) {
				slices = 1;
				letterPosition = 0;
				hasSufffix = moveString.length === 2;
			} else if (moveString.match(/^[xyz]['2]?$/)) {
				slices = spec.edgeLength;
				letterPosition = 0;
				hasSufffix = moveString.length === 2;
			} else {
				throw 'Invalid CML string';
			}

			let face = CubeMoveLanguage.parseFace(moveString.substr(letterPosition, 1));
			let angle = CubeMoveLanguage.parseAngle(hasSufffix ? moveString.substr(-1, 1) : '');

			return new CubeMove(spec, face, slices, angle);
		});
	}

	private static parseFace(faceString: string) {
		switch (faceString) {
			case 'F':
			case 'z':
				return 0;
			case 'R':
			case 'x':
				return 1;
			case 'U':
			case 'y':
				return 2;
			case 'B':
				return 3;
			case 'L':
				return 4;
			case 'D':
				return 5;
			default:
				throw 'Invalid CML face string';
		}
	}

	private static parseAngle(angleString: string) {
		switch (angleString) {
			case '':
				return 1;
			case '2':
				return 2;
			case '\'':
				return -1;
			default:
				throw 'Invalid CML angle string';
		}
	}

	static stringify(moves: CubeMove[], cubeLength: number = 3) {
		if (!Number.isInteger(cubeLength) || cubeLength < 2 || cubeLength > 8) throw 'Invalid cube length';
		return moves.map(function (move) {
			if(move.angle % 4 === 0) {
				return null;
			}
			let moveString = '';
			let angleModifier: number;
			if (move.slices < cubeLength) {
				if (move.slices > 2) {
					moveString += move.slices;
				}
				moveString += CubeMoveLanguage.stringifyFace(move.face);
				if (move.slices > 1) {
					moveString += 'w';
				}
				angleModifier = 1;
			} else {
				moveString += CubeMoveLanguage.stringifyRotationFace(move.face);
				angleModifier = 1;
				if(move.face >= 3) {
					angleModifier = -1;
				}
			}
			moveString += CubeMoveLanguage.stringifyAngle(move.angle * angleModifier);
			return moveString;
		}).filter(function(moveString) {
			return moveString !== null;
		}).join(' ');
	}

	private static stringifyFace(face: number) {
		switch (face) {
			case 0:
				return 'F';
			case 1:
				return 'R';
			case 2:
				return 'U';
			case 3:
				return 'B';
			case 4:
				return 'L';
			case 5:
				return 'D';
			default:
				throw 'Invalid face';
		}
	}

	private static stringifyRotationFace(face: number) {
		switch (face) {
			case 0:
			case 3:
				return 'z';
			case 1:
			case 4:
				return 'x';
			case 2:
			case 5:
				return 'y';
			default:
				throw 'Invalid face';
		}
	}

	private static stringifyAngle(angle: number) {
		switch (((angle % 4) + 4) % 4) {
			case 0:
				throw 'No move';
			case 1:
				return '';
			case 2:
				return '2';
			case 3:
				return '\'';
			default:
				throw 'Invalid angle';
		}
	}

}