import { Cube } from "./Cube";
import { CubeletOrientation } from "./CubeletOrientation";
import { ReadonlyCubelet } from "./ReadonlyCubelet";

export class CubeSolutionCondition {

	isCubeletSolved(cubelet: ReadonlyCubelet): boolean {
		return cubelet.initialLocation.equals(cubelet.location) && cubelet.orientation.equals(CubeletOrientation.IDENTITY);
	}
	
	isCubeSolved(cube: Cube): boolean {
		return cube.cubelets.findAll().every(c => this.isCubeletSolved(c));
	}

}