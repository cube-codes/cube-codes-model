import { CubeFace } from "../Cube Geometry/CubeFace";
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
		location?: CubeletLocation,
		orientation?: CubeletOrientation) {

		this.#location = location ?? initialLocation;
		this.#orientation = orientation ?? CubeletOrientation.IDENTITY;

		if (!this.cube.spec.equals(this.initialLocation.spec)) throw new Error(`Invalid spec of intial location (expected: ${this.cube.spec}): ${this.initialLocation.spec}`);
		if (!this.cube.spec.equals(this.#location.spec)) throw new Error(`Invalid spec of location (expected: ${this.cube.spec}): ${this.#location.spec}`);
		if (!this.initialLocation.type.equals(this.#location.type)) throw new Error(`Invalid type of location (expected: ${this.initialLocation.type}): ${this.#location.type}`);
	}

	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	toString(): string {
		return this.type.toString() + '(' + this.initialLocation.toString() + '->' + this.location.toString() + '|' + this.orientation.toString() + ')';
	}

	get location(): CubeletLocation {
		return this.#location;
	}

	get orientation(): CubeletOrientation {
		return this.#orientation;
	}

	get type(): CubePartType {
		return this.initialLocation.type;
	}

	isSolved(): boolean {
		return this.cube.solutionCondition.isCubeletSolved(this);
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

	getCubeletFaceShownAtCubeFace(cubeFace:CubeFace):CubeFace {
		return CubeFace.getByNormalVector(this.orientation.matrix.inverse().vectorMultiply(cubeFace.getNormalVector()));
	}

}
