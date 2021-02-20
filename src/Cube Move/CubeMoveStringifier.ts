import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Dimension } from "../Linear Algebra/Dimension";
import { CubeMove } from "./CubeMove";

export class CubeMoveStringifier {

	private static readonly SEPARATOR: RegExp = /[\s_]+/

	private static readonly LANGUAGE: RegExp = /^(?:(?:(?:(?<rangeStart>[1-9][0-9]*)-)?(?<rangeCount>[0-9][0-9]*)?(?<rangeFace>r|u|f|l|d|b|Rw|Uw|Fw|Lw|Dw|Bw))|(?:(?<rotationFace>x|y|z))|(?:(?<inlayFace>m|e|s))|(?:(?<sliceStart>[1-9][0-9]*)?(?<sliceFace>R|U|F|L|D|B))|(?:(?<middleFace>M|E|S)))(?<angle>[0-9][0-9]*)?(?<angleInverted>')?$/

	constructor(private readonly spec: CubeSpecification) { }

	parse(movesString: string): ReadonlyArray<CubeMove> {
		return movesString.split(CubeMoveStringifier.SEPARATOR).map(moveString => {

			if (moveString === '') {
				return null;
			}

			const regexResult = moveString.match(CubeMoveStringifier.LANGUAGE);

			let face;
			let sliceStart;
			let sliceEnd;
			let angleOrientation;
			if (regexResult === null) {
				throw new Error(`Invalid CML string: ${moveString}`);
			} else if (regexResult.groups?.rangeFace !== undefined) { // range
				face = this.parseFace(regexResult.groups?.rangeFace);
				sliceStart = parseInt(regexResult.groups?.rangeStart ?? '1');
				sliceEnd = parseInt(regexResult.groups?.rangeCount ?? (sliceStart + 1).toString());
				angleOrientation = 1;
			} else if (regexResult.groups?.rotationFace !== undefined) { // rotation
				face = this.parseFace(regexResult.groups?.rotationFace);
				sliceStart = 1;
				sliceEnd = this.spec.edgeLength;
				angleOrientation = 1;
			} else if (regexResult.groups?.inlayFace !== undefined) { // inlay
				if(this.spec.edgeLength < 3) {
					return null;
				}
				face = this.parseFace(regexResult.groups?.inlayFace);
				sliceStart = 2;
				sliceEnd = this.spec.edgeLength - 1;
				angleOrientation = face.dimension.equals(Dimension.Z) ? 1 : -1;
			} else if (regexResult.groups?.sliceFace !== undefined) { // slice
				face = this.parseFace(regexResult.groups?.sliceFace);
				sliceStart = parseInt(regexResult.groups?.sliceStart ?? '1');
				sliceEnd = sliceStart;
				angleOrientation = 1;
			} else if (regexResult.groups?.middleFace !== undefined) { // middle
				if(this.spec.edgeLength % 2 === 0) {
					return null;
				}
				face = this.parseFace(regexResult.groups?.middleFace);
				sliceStart = Math.floor((this.spec.edgeLength + 1) / 2);
				sliceEnd = sliceStart;
				angleOrientation = face.dimension.equals(Dimension.Z) ? 1 : -1;
			} else {
				throw new Error(`Invalid CML string: ${moveString}`);
			}

			const angle = parseInt(regexResult.groups?.angle ?? 1) * (regexResult.groups?.angleInverted === undefined ? 1 : regexResult.groups?.angleInverted === "'" ? -1 : NaN) * angleOrientation;

			if (isNaN(sliceStart) || isNaN(sliceEnd) || isNaN(angle)) {
				throw new Error(`Invalid CML string: ${moveString}`);
			}

			return new CubeMove(this.spec, face, sliceStart, sliceEnd, angle);

		}).filter(move => move !== null).map(move => move as CubeMove);
	}

	private parseFace(faceString: string): CubeFace {
		switch (faceString) {
			case 'r':
			case 'Rw':
			case 'x':
			case 'm':
			case 'R':
			case 'M':
				return CubeFace.RIGHT;
			case 'u':
			case 'Uw':
			case 'y':
			case 'e':
			case 'U':
			case 'E':
				return CubeFace.UP;
			case 'f':
			case 'Fw':
			case 'z':
			case 's':
			case 'F':
			case 'S':
				return CubeFace.FRONT;
			case 'l':
			case 'Lw':
			case 'L':
				return CubeFace.LEFT;
			case 'b':
			case 'Bw':
			case 'B':
				return CubeFace.BACK;
			case 'd':
			case 'Dw':
			case 'D':
				return CubeFace.DOWN;
			default:
				throw new Error(`Invalid CML face string: ${faceString}`);
		}
	}

	stringify(moves: ReadonlyArray<CubeMove>): string {
		return moves.map(move => {

			let angleOrientation;
			let moveString = '';

			if (this.spec.edgeLength % 2 === 1 && move.sliceStart === Math.ceil(this.spec.edgeLength / 2) && move.sliceEnd === move.sliceStart) { // middle
				angleOrientation = (move.face.positiveDirection ? 1 : -1) * (move.face.dimension.equals(Dimension.Z) ? 1 : -1);
				moveString += this.stringifyMiddleFace(move.face);
			} else if (move.sliceEnd === move.sliceStart) { // slice
				angleOrientation = 1;
				moveString += move.sliceStart !== 1 ? move.sliceStart.toString() : '';
				moveString += this.stringifySliceFace(move.face);
			} else if (move.sliceStart === 2 && move.sliceEnd === this.spec.edgeLength - 1) { // inlay
				angleOrientation = (move.face.positiveDirection ? 1 : -1) * (move.face.dimension.equals(Dimension.Z) ? 1 : -1);
				moveString += this.stringifyInlayFace(move.face);
			} else if (move.sliceStart === 1 && move.sliceEnd === this.spec.edgeLength) { // rotation
				angleOrientation = (move.face.positiveDirection ? 1 : -1);
				moveString += this.stringifyRotationFace(move.face);
			} else { // range
				angleOrientation = 1;
				moveString += move.sliceStart !== 1 ? move.sliceStart.toString() + '-' : '';
				moveString += move.sliceEnd !== move.sliceStart + 1 ? move.sliceEnd.toString() : '';
				moveString += this.stringifyRangeFace(move.face);
			}

			moveString += this.stringifyAngle(move.angle * angleOrientation);

			return moveString;

		}).join(' ');
	}

	private stringifyMiddleFace(face: CubeFace): string {
		switch (face.dimension) {
			case Dimension.X:
				return 'M';
			case Dimension.Y:
				return 'E';
			case Dimension.Z:
				return 'S';
			default:
				throw new Error(`Invalid dimension: ${face.dimension}`);
		}
	}

	private stringifySliceFace(face: CubeFace): string {
		switch (face) {
			case CubeFace.RIGHT:
				return 'R';
			case CubeFace.UP:
				return 'U';
			case CubeFace.FRONT:
				return 'F';
			case CubeFace.LEFT:
				return 'L';
			case CubeFace.DOWN:
				return 'D';
			case CubeFace.BACK:
				return 'B';
			default:
				throw new Error(`Invalid face: ${face}`);
		}
	}

	private stringifyInlayFace(face: CubeFace): string {
		switch (face.dimension) {
			case Dimension.X:
				return 'm';
			case Dimension.Y:
				return 'e';
			case Dimension.Z:
				return 's';
			default:
				throw new Error(`Invalid dimension: ${face.dimension}`);
		}
	}

	private stringifyRotationFace(face: CubeFace): string {
		switch (face.dimension) {
			case Dimension.X:
				return 'x';
			case Dimension.Y:
				return 'y';
			case Dimension.Z:
				return 'z';
			default:
				throw new Error(`Invalid dimension: ${face.dimension}`);
		}
	}

	private stringifyRangeFace(face: CubeFace): string {
		switch (face) {
			case CubeFace.RIGHT:
				return 'r';
			case CubeFace.UP:
				return 'u';
			case CubeFace.FRONT:
				return 'f';
			case CubeFace.LEFT:
				return 'l';
			case CubeFace.DOWN:
				return 'd';
			case CubeFace.BACK:
				return 'b';
			default:
				throw new Error(`Invalid face: ${face}`);
		}
	}

	private stringifyAngle(angle: number): string {
		const absoluteAngle = Math.abs(angle).toString();
		return (absoluteAngle !== '1' ? absoluteAngle : '') + (angle < 0 ? '\'' : '');
	}

}