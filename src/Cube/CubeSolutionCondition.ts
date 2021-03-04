import { Cube } from "./Cube";
import { CubeletOrientation } from "./CubeletOrientation";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { ReadonlyCubelet } from "./ReadonlyCubelet";
import { Exportable } from "../Interface/Exportable";
import { Equalizable } from "../Interface/Equalizable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { CubeletLocation } from "./CubeletLocation";


/** 
 * 0 = A cube counts as solved if all cubelets are at their initial place and orientation
 * 1 = The most "usual" condition for a 6-color cube: A cube counts as solved if all cubelets are location-wise at least in their initial cubeparts and have identityCorner/Edge orientation.
 */
export enum CubeSolutionConditionType {
	STRICT = 0,
	COLOR = 1
}

export class CubeSolutionCondition implements Exportable<number>, Equalizable<CubeSolutionCondition>, Printable {

	constructor(readonly type: CubeSolutionConditionType) { }

	static import(value: number): CubeSolutionCondition {
		return new CubeSolutionCondition(value);
	}

	export(): number {
		return this.type;
	}

	equals(other: CubeSolutionCondition): boolean {
		return this.type === other.type;
	}

	toString(): string {
		//TODO: ???
		return '';
	}

	isCubeletSolvedFromPerspective(cubelet: ReadonlyCubelet, perspective: CubeletOrientation): boolean {
		switch (this.type) {
			case CubeSolutionConditionType.STRICT:
				return perspective.matrix.inverse().vectorMultiply(cubelet.currentLocation.origin).equals(cubelet.initialLocation.origin)
					&& perspective.matrix.inverse().multiply(cubelet.currentOrientation.matrix).equals(Matrix.IDENTITY);
			case CubeSolutionConditionType.COLOR:
				return new CubeletLocation(cubelet.cube.spec, perspective.matrix.inverse().vectorMultiply(cubelet.currentLocation.origin)).part.equals(cubelet.initialLocation.part)
					&& (cubelet.currentLocation.type.equals(CubePartType.FACE) || perspective.matrix.inverse().multiply(cubelet.currentOrientation.matrix).equals(Matrix.IDENTITY));
			default:
				throw Error(`Invalid type: ${this.type}`);
		}
	}

	isCubeSolvedFromPerspective(cube: Cube, perspective: CubeletOrientation): boolean {
		return cube.cubelets.every(c => this.isCubeletSolvedFromPerspective(c, perspective));
	}

	isCubeSolved(cube: Cube): boolean {
		return CubeletOrientation.getAll().some(p => this.isCubeSolvedFromPerspective(cube, p));
	}

}
