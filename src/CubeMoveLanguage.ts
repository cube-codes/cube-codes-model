import { CubeMove, CubeSpecification } from "./Cube";

export class CubeMoveLanguage {

	constructor(private readonly spec: CubeSpecification) {}

	parse(movesString: string) {
		let me = this;
		// Split by everything that is not command character
		return movesString.split(/[^1-9FRUBLDw'xyz]+/).map(function (moveString) {

			let slices: number;
			let faceLetterPosition: number;
			let hasAngleSpecifier: boolean;
			if (moveString.match(/^\d?[FRUBLD]w['2]?$/)) { // If outer block move
				slices = parseInt(moveString.substr(0, 1));
				faceLetterPosition = 1;
				hasAngleSpecifier = moveString.length === 4;
				if (isNaN(slices)) { // If there was no slice prefix
					slices = 2;
					faceLetterPosition = 0;
					hasAngleSpecifier = moveString.length === 3;
				}
			} else if (moveString.match(/^[FRUBLD]['2]?$/)) { // If face moves
				slices = 1;
				faceLetterPosition = 0;
				hasAngleSpecifier = moveString.length === 2;
			} else if (moveString.match(/^[xyz]['2]?$/)) { // If rotation
				slices = me.spec.edgeLength;
				faceLetterPosition = 0;
				hasAngleSpecifier = moveString.length === 2;
			} else {
				throw 'Invalid CML string';
			}

			let face = me.parseFace(moveString.substr(faceLetterPosition, 1));
			let angle = me.parseAngle(hasAngleSpecifier ? moveString.substr(-1, 1) : '');

			return new CubeMove(me.spec, face, slices, angle);
		});
	}

	private parseFace(faceString: string) {
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

	private parseAngle(angleString: string) {
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

	stringify(moves: CubeMove[]) {
		let me = this;
		return moves.filter(function(move) {

			// Remove moves with 0 degree
			return move.angle % 4 !== 0;

		}).map(function (move) {

			let moveString = '';
			let angleOrientation = 1;
			if (move.slices < me.spec.edgeLength) { // If no rotation

				if (move.slices > 2) {
					// Add slice prefix
					moveString += move.slices;
				}

				// Add face letter
				moveString += me.stringifyFace(move.face);
				
				if (move.slices > 1) {
					// Add slice suffix
					moveString += 'w';
				}

			} else { // If rotation
				
				// Add rotation face letter
				moveString += me.stringifyRotationFace(move.face);
				
				// Change angle orientation if face has different orientation as rotation letter (e.g. "z" aligns with "F", but counteraligns with "B")
				if(move.face >= 3) {
					angleOrientation = -1;
				}

			}
			
			// Add angle specifier
			moveString += me.stringifyAngle(move.angle * angleOrientation);
			
			return moveString;

		}).join(' ');
	}

	private stringifyFace(face: number) {
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

	private stringifyRotationFace(face: number) {
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

	private stringifyAngle(angle: number) {
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