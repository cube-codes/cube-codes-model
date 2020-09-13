import { CubeSpecification } from "./CubeGeometry";
import { CubeMove } from "./CubeMove";
import { CubeFace } from "./CubePart";

export class CubeMoveLanguage {

	constructor(private readonly spec: CubeSpecification) {}

	parse(movesString: string): ReadonlyArray<CubeMove> {
		const me = this;
		// Split by seperators
		return movesString.split(/[\s_]+/).map(function (moveString) {

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
				throw new Error(`Invalid CML string: ${moveString}`);
			}

			const face = me.parseFace(moveString.substr(faceLetterPosition, 1));
			const angle = me.parseAngle(hasAngleSpecifier ? moveString.substr(-1, 1) : '');

			return new CubeMove(me.spec, face, slices, angle);
		});
	}

	private parseFace(faceString: string): CubeFace {
		switch (faceString) {
			case 'F':
			case 'z':
				return CubeFace.FRONT;
			case 'R':
			case 'x':
				return CubeFace.RIGHT;
			case 'U':
			case 'y':
				return CubeFace.UP;
			case 'B':
				return CubeFace.BACK;
			case 'L':
				return CubeFace.LEFT;
			case 'D':
				return CubeFace.DOWN;
			default:
				throw new Error(`Invalid CML face string: ${faceString}`);
		}
	}

	private parseAngle(angleString: string): number {
		switch (angleString) {
			case '':
				return 1;
			case '2':
				return 2;
			case '\'':
				return -1;
			default:
				throw new Error(`Invalid CML angle string: ${angleString}`);
		}
	}

	stringify(moves: ReadonlyArray<CubeMove>): string {
		const me = this;
		return moves.filter(move => move.angle % 4 !== 0).map(move => {

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
				if(move.face.backside) {
					angleOrientation = -1;
				}

			}
			
			// Add angle specifier
			moveString += me.stringifyAngle(move.angle * angleOrientation);
			
			return moveString;

		}).join(' ');
	}

	private stringifyFace(face: CubeFace): string {
		switch (face) {
			case CubeFace.FRONT:
				return 'F';
			case CubeFace.RIGHT:
				return 'R';
			case CubeFace.UP:
				return 'U';
			case CubeFace.BACK:
				return 'B';
			case CubeFace.LEFT:
				return 'L';
			case CubeFace.DOWN:
				return 'D';
			default:
				throw new Error(`Invalid face: ${face}`);
		}
	}

	private stringifyRotationFace(face: CubeFace): string {
		switch (face) {
			case CubeFace.FRONT:
			case CubeFace.BACK:
				return 'z';
			case CubeFace.RIGHT:
			case CubeFace.LEFT:
				return 'x';
			case CubeFace.UP:
			case CubeFace.DOWN:
				return 'y';
			default:
				throw new Error(`Invalid face: ${face}`);
		}
	}

	private stringifyAngle(angle: number): string {
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
				throw new Error(`Invalid angle: ${angle}`);
		}
	}

}