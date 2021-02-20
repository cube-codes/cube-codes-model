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
 * 0 = A cube counts as solved iff all cubelets are at their initial place  and orientation
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

	isCubeletSolved(cubelet: ReadonlyCubelet): boolean {
		switch (this.type) {
			case CubeSolutionConditionType.STRICT:
				return cubelet.location.equals(cubelet.initialLocation) && cubelet.orientation.equals(CubeletOrientation.IDENTITY);
			case CubeSolutionConditionType.COLOR:
				return cubelet.location.part.equals(cubelet.initialLocation.part) && (cubelet.location.type.equals(CubePartType.FACE) || cubelet.orientation.equals(CubeletOrientation.IDENTITY));
			default:
				throw Error(`Invalid type: ${this.type}`);
		}
	}

	/** If you rotate by perspective, then the result is solved from this perspective  */
	private isCubeSolvedfromPerspective(cube: Cube, perspective:Matrix):boolean {
		for(let cubelet of cube.cubelets) {
			switch (this.type) {
				case CubeSolutionConditionType.STRICT:
					if (!(
					perspective.inverse().vectorMultiply(cubelet.location.origin).equals(cubelet.initialLocation.origin)
					&& perspective.inverse().multiply(cubelet.orientation.matrix).equals(Matrix.IDENTITY)
					)) return false;
					else break;
				case CubeSolutionConditionType.COLOR:
					if (!(
						(new CubeletLocation(cube.spec,perspective.inverse().vectorMultiply(cubelet.location.origin)).part.equals(cubelet.initialLocation.part))
						&& (cubelet.location.type.equals(CubePartType.FACE) || perspective.inverse().multiply(cubelet.orientation.matrix).equals(Matrix.IDENTITY))
						)) return false;
					else break;
				default:
					throw Error(`Invalid type: ${this.type}`);
			}
		}
		return true;
	}

	isCubeSolved(cube: Cube): boolean {
		//return cube.getInspector().findAll().every(c => this.isCubeletSolved(c));
		for (let perspective of CubeletOrientation.ALL()) {
			if (this.isCubeSolvedfromPerspective(cube,perspective)) return true;
		}
		return false;
	}

}
