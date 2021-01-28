import { CubeSpecification, CubeCoordinates, CubeDimension, Identifiable, Printable } from "../Linear Algebra/Vector";
import { Matrix, inv } from "mathjs";
import { CubePartType, CubeFace, CubePart } from "../Cube Geometry/CubePart";
import { Cube } from "./Cube";
import deepEqual from "deep-equal";
import { Matrices } from "../Linear Algebra/Matrices";

/**
 * Wraps an orthogonal matrix that describes how the cubical is currently rotated around its center, in comparison to its standard location and orientation.
 */
export class CubicalOrientation implements Identifiable, Printable {

	/** 
	 * The standard orientation
	 */
	static readonly IDENTITY: CubicalOrientation = new CubicalOrientation(Matrices.IDENTITY);

	constructor(readonly matrix: Matrix) {}

	toId() {
		return this.matrix.toJSON();
	}

	toString() {
		return this.matrix.toString();
	}

	/**
	 * Multiplies the current orientation this.matrix with a 90° rotation around the axis "dimension".
	 * @param dimension 
	 */
	rotate(dimension: CubeDimension): CubicalOrientation {
		return new CubicalOrientation(Matrices.rotateMatrix(this.matrix, dimension));
	}

	/** 
	 * There are 24 rotations of the cube, these can be identified as group with the symmetric group S4, by observing how pairs of antipodal corners are permuted.
	 * 
	 * @param permutation A permutation of the numbers {1,2,3,4}
	 */
	static fromS4Element(permutation: Array<number>): CubicalOrientation {
		throw new Error('Not yet implemented');
	}

	/** 
	 * There are 24 rotations of the cube, these can be identified as group with the symmetric group S4, by observing how pairs of antipodal corners are permuted.
	 * 
	 * @param orientation An orientation 
	 */
	static toS4Element(orientation: CubicalOrientation): Array<number> {
		throw new Error('Not yet implemented');
	}

}

/** 
 * Immutable. Wraps a CubeCoordinate in the cube, which has recognized the containing CubePart (Corner, Edge, Face) and local coordinates (or thrown an error).
 * 
 */
export class CubicalLocation implements Identifiable, Printable {

	readonly part: CubePart;

	readonly coordinatesInPartDirections: ReadonlyArray<number>;

	constructor(readonly spec: CubeSpecification, readonly coordinates: CubeCoordinates) {

		let partOrigin = CubeCoordinates.ZERO;
		const partDirections = new Array<CubeDimension>();
		const coordinatesInPart = new Array<number>();

		//Go through all dimensions and see if the result is sharp 0 resp. max or if it is some value in between.
		const coordinateMaximum = spec.edgeLength - 1;
		for (const dimension of CubeDimension.getAll()) {
			const coordinate = coordinates.getComponent(dimension);
			if (coordinate == coordinateMaximum) {
				partOrigin = partOrigin.addAt(dimension, 1);
			} else if (coordinate == 0) {
				partOrigin = partOrigin.addAt(dimension, 0); //redundant, but for completeness
			} else if (coordinate > 0 && coordinate < coordinateMaximum) {
				partDirections.push(dimension);
				coordinatesInPart.push(coordinate);
			} else if (coordinate < 0 || coordinate > coordinateMaximum) {
				throw new Error(`Coordinates outside of cube: ${coordinates}`);
			}
		}

		if (partDirections.length == 3) throw new Error(`Coordinates inside of cube: ${coordinates}`);

		this.part = CubePart.getByOriginAndDirections(partOrigin, partDirections);
		this.coordinatesInPartDirections = coordinatesInPart;

	}

	/** Computes a CubicalLocation on given CubePart toghether with local coordinates. Used in CubicalLocation.getAll and IndexToLocation.fromIndex and possibly during cube inspection.
	 * 
	 */
	static fromPartAndCoordinatesInPart(spec: CubeSpecification, part: CubePart, coordinatesInPart: ReadonlyArray<number>): CubicalLocation {

		if (part.directions.length != coordinatesInPart.length) throw new Error(`Coordinates in part have wrong length (expected: ${part.directions.length}): ${coordinatesInPart.length}`);

		let coordinates: CubeCoordinates = part.origin.multiply(spec.edgeLength - 1);
		for (let directionIndex = 0; directionIndex < part.directions.length; directionIndex++) {
			coordinates = coordinates.addAt(part.directions[directionIndex], coordinatesInPart[directionIndex]);
		}

		return new CubicalLocation(spec, coordinates);

	}


	/**Constructs all cubical locations inside (i.e. ecluding lowerdimensional boundary) of a given Face/Edge/Corner
	 * essentially by covering all possibilities in the if-tree in the constructor
	*/
	static fromPart(spec: CubeSpecification, part: CubePart): ReadonlyArray<CubicalLocation> {
		const result: Array<CubicalLocation> = new Array<CubicalLocation>();
		if (part.type == CubePartType.CORNER) {
			result.push(CubicalLocation.fromPartAndCoordinatesInPart(spec, part, []));
		} else if (part.type == CubePartType.EDGE) {
			for (let remainingCoordinate = 1; remainingCoordinate < spec.edgeLength - 1; remainingCoordinate++) {
				result.push(CubicalLocation.fromPartAndCoordinatesInPart(spec, part, [remainingCoordinate]));
			}
		} else if (part.type == CubePartType.FACE) {
			for (let remainingCoordinate0 = 1; remainingCoordinate0 < spec.edgeLength - 1; remainingCoordinate0++) {
				for (let remainingCoordinate1 = 1; remainingCoordinate1 < spec.edgeLength - 1; remainingCoordinate1++) {
					result.push(CubicalLocation.fromPartAndCoordinatesInPart(spec, part, [remainingCoordinate0, remainingCoordinate1]));
				}
			}
		} else {
			throw new Error(`Invalid type: ${part.type}`);
		}
		return result;
	}

	toId() {
		return this.coordinates.toId();
	}

	toString() {
		return this.coordinates.toString();
	}

	get type() {
		return this.part.type;
	}

	isAdjectedTo(part: CubePart): boolean {
		return this.part.isAdjectedTo(part);
	}

	isAlong(dimension: CubeDimension): boolean {
		return this.part.directions.some(d => d === dimension);
	}

	rotate(dimension: CubeDimension): CubicalLocation {
		return new CubicalLocation(this.spec, this.coordinates.rotate(this.spec, dimension));
	}


}
export interface CubicalSolvedCondition {

	(cubical: ReadonlyCubical): boolean

}

export interface ReadonlyCubical extends Identifiable, Printable {

	readonly cube: Cube

	readonly initialLocation: CubicalLocation

	readonly location: CubicalLocation

	readonly orientation: CubicalOrientation

	readonly type: CubePartType

	isSolved(customCondition?: CubicalSolvedCondition): boolean

}

export class Cubical implements ReadonlyCubical {

	#location: CubicalLocation;

	#orientation: CubicalOrientation;

	constructor(
		readonly cube: Cube,
		readonly initialLocation: CubicalLocation,
		location?: CubicalLocation,
		orientation?: CubicalOrientation) {

		this.#location = location ?? initialLocation;
		this.#orientation = orientation ?? CubicalOrientation.IDENTITY;

		if (!deepEqual(this.cube.spec, this.initialLocation.spec)) throw new Error(`Invalid spec of intial location (expected: ${this.cube.spec}): ${this.initialLocation.spec}`);
		if (!deepEqual(this.cube.spec, this.#location.spec)) throw new Error(`Invalid spec of location (expected: ${this.cube.spec}): ${this.#location.spec}`);
		if (!deepEqual(this.initialLocation.type, this.#location.type)) throw new Error(`Invalid type of location (expected: ${this.initialLocation.type}): ${this.#location.type}`);
	}

	toId() {
		return this.initialLocation.toId()
	}

	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	toString(): string {
		return this.type.toString() + '(' + this.initialLocation.toString() + '->' + this.location.toString() + '|' + this.orientation.toString() + ')';
	}

	get location(): CubicalLocation {
		return this.#location;
	}

	get orientation(): CubicalOrientation {
		return this.#orientation;
	}

	get type(): CubePartType {
		return this.initialLocation.type;
	}

	isSolved(customCondition?: CubicalSolvedCondition): boolean {
		const condition: CubicalSolvedCondition = customCondition ?? this.cube.solvedCondition;
		return condition.call(undefined, this);
	}

	rotate(dimension: CubeDimension): void {
		this.#location = this.#location.rotate(dimension);
		this.#orientation = this.#orientation.rotate(dimension);
	}
	
	beam(location: CubicalLocation, orientation: CubicalOrientation) {
		this.#location = location;
		if (!deepEqual(this.cube.spec, this.#location.spec)) throw new Error(`Invalid spec of location (expected: ${this.cube.spec}): ${this.#location.spec}`);
		if (!deepEqual(this.initialLocation.type, this.#location.type)) throw new Error(`Invalid type of location (expected: ${this.initialLocation.type}): ${this.#location.type}`);
		this.#orientation = orientation;
	}

	/** Computes, which initial face (color) is shown if one looks at the cube at the new location on some face.
	 * 
	 * @param cubeFace The face from which we look at the cubical
	 */
	//TODO: Was macht das hier?
	getColorShownOnSomeFace(cubeFace: CubeFace): CubeFace {
		this.location.part.isContainedInFace(cubeFace); // just validates the request
		let result: CubeFace = CubeFace.getByNormalVector(cubeFace.getNormalVector().transformAroundZero(inv(this.orientation.matrix)));
		this.initialLocation.part.isContainedInFace(result); // just validates the result
		return result;
	}

}
