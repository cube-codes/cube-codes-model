import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { Dimension } from "../Linear Algebra/Dimension";
import { Cube } from "./Cube";
import { CubeletLocation } from "./CubeletLocation";
import { CubeletOrientation } from "./CubeletOrientation";
import { ReadonlyCubelet } from "./ReadonlyCubelet";

export class Cubelet implements ReadonlyCubelet {

	#location: CubeletLocation;

	#orientation: CubeletOrientation;

	constructor(
		readonly cube: Cube,
		readonly initialLocation: CubeletLocation,
		currentLocation?: CubeletLocation,
		currentOrientation?: CubeletOrientation) {

		this.#location = currentLocation ?? initialLocation;
		this.#orientation = currentOrientation ?? CubeletOrientation.IDENTITY;

		if (!this.cube.spec.equals(this.initialLocation.spec)) throw new Error(`Invalid spec of intial location (expected: ${this.cube.spec}): ${this.initialLocation.spec}`);
		if (!this.cube.spec.equals(this.#location.spec)) throw new Error(`Invalid spec of location (expected: ${this.cube.spec}): ${this.#location.spec}`);
		if (!this.initialLocation.type.equals(this.#location.type)) throw new Error(`Invalid type of location (expected: ${this.initialLocation.type}): ${this.#location.type}`);
	}

	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	toString(): string {
		return this.type.toString() + '(' + this.initialLocation.toString() + '->' + this.currentLocation.toString() + '|' + this.currentOrientation.toString() + ')';
	}

	//convenience, as it shows the colors
	getInitialPart() :CubePart {
		return this.initialLocation.part;
	}

	get currentLocation(): CubeletLocation {
		return this.#location;
	}

	//convenience, in particular at Cube3 
	getCurrentPart() :CubePart {
		return this.#location.part;
	}

	get currentOrientation(): CubeletOrientation {
		return this.#orientation;
	}

	get type(): CubePartType {
		return this.initialLocation.type;
	}

	//Using getPerpectiveFromMids for odd cubes
	isSolved(): boolean {
		return this.cube.solutionCondition.isCubeletSolvedFromPerspective(this,this.cube.getPerspectiveFromFaceMids())
	}

	getSolvedLocation():CubeletLocation {
		return new CubeletLocation(this.cube.spec, this.cube.getPerspectiveFromFaceMids().vectorMultiply(this.initialLocation.origin));
	}

	//convenience, in particular at Cube3 
	getSolvedPart():CubePart {
		return this.getSolvedLocation().part;
	}

	rotate(dimension: Dimension): void {
		this.#location = this.#location.rotate(dimension);
		this.#orientation = this.#orientation.rotate(dimension);
	}

	beam(newLocation: CubeletLocation, newOrientation: CubeletOrientation) {
		if (!this.cube.spec.equals(newLocation.spec)) throw new Error(`Invalid spec of location (expected: ${this.cube.spec}): ${newLocation.spec}`);
		if (!this.initialLocation.type.equals(newLocation.type)) throw new Error(`Invalid type of location (expected: ${this.initialLocation.type}): ${newLocation.type}`);
		this.#location = newLocation;
		this.#orientation = newOrientation;
	}

	getColorAt(currentFace:CubeFace):CubeFace {
		if (!this.currentLocation.part.normalVectors.find(v => currentFace.equals(v))) throw Error("Cubelet is not visible from currentFace");
		return CubeFace.getByNormalVector(this.currentOrientation.matrix.inverse().vectorMultiply(currentFace.getNormalVector()));
	}

}
