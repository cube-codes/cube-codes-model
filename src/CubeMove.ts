import { CubeSpecification } from "./CubeGeometry";
import { CubeFace } from "./CubePart";

// Hotkey
export enum CubeMoveAngle {
	C90 = 1,
	C180 = 2,
	CC90 = -1
}

export class CubeMove {

	constructor(readonly spec: CubeSpecification,
		readonly face: CubeFace,
		readonly slices: number,
		readonly angle: number | CubeMoveAngle) {
		if (!Number.isInteger(slices) || slices < 1 || slices > this.spec.edgeLength) throw 'Invalid slices';
		if (!Number.isInteger(angle)) throw 'Invalid angel';
	}

	getInverse(): CubeMove {
		return new CubeMove(this.spec, this.face, this.slices, -this.angle);
	}

}