import { Cube } from "./Cube";
import { CubeletOrientation } from "./CubeletOrientation";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { ReadonlyCubelet } from "./ReadonlyCubelet";
import { Exportable } from "../Interface/Exportable";
import { Equalizable } from "../Interface/Equalizable";
import { Printable } from "../Interface/Printable";


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

	isCubeSolved(cube: Cube): boolean {
		return cube.cubelets.every(c => this.isCubeletSolved(c));
	}

}
