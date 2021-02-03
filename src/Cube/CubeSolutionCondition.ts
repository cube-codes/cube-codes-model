import { Cube } from "./Cube";
import { CubeletOrientation } from "./CubeletOrientation";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { ReadonlyCubelet } from "./ReadonlyCubelet";
import { Exportable } from "../Interface/Exportable";


/** 0 = A cube counts as solved iff all cubelets are at their initial place  and orientation
 *  1 = The most "usual" condition for a 6-color cube: A cube counts as solved iff all cubelets are location-wise at least in their initial cubeparts and have identityCorner/Edge orientation (not Face). 
 */
export enum CubeSolutionConditionType {
	STRICT = 0,
	COLOR = 1,
}

export class CubeSolutionCondition implements Exportable{

	constructor(readonly type:CubeSolutionConditionType) {

	}
	
	isCubeletSolved(cubelet: ReadonlyCubelet): boolean {
		if (this.type==CubeSolutionConditionType.STRICT) {
			return cubelet.initialLocation.equals(cubelet.location) 
			&& cubelet.orientation.equals(CubeletOrientation.IDENTITY);
		} else if (this.type==CubeSolutionConditionType.COLOR) {
			return (cubelet.location.part.equals(cubelet.initialLocation.part) 
			&& (cubelet.location.type.equals(CubePartType.FACE) || cubelet.orientation.equals(CubeletOrientation.IDENTITY)));
		} else {
			throw Error('Unknown CubeSolutionConditionType')
		}

	}

	isCubeSolved(cube: Cube): boolean {
		return cube.cubelets.findAll().every(c => this.isCubeletSolved(c));
	}
	
	export() : string {
		return this.type.toString();
	}

	static import(solv: string): CubeSolutionCondition {
		return new CubeSolutionCondition(parseInt(solv));
	}
}
