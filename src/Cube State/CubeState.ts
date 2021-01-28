import { CubeCoordinates, CubeSpecification, Printable } from "../Linear Algebra/Vector";
import { CubePartType, CubePart } from "../Cube Geometry/CubePart";
import { CubicalLocation, CubicalOrientation, ReadonlyCubical, Cubical } from "../Cube/Cubical";
import { Matrices } from "../Linear Algebra/Matrices";
import deepEqual from "deep-equal";


/** The CubeState encodes the permutations and reorientations. 
 * 
 * They are encoded by indices (corresponding to locations on any cubePart) and reorientation numbers (how the normal vectors are shifted with respect to a fixed standard ordering) - the class provides static methods to convert these indices
 * 
 */
//TODO: Refactor
export class CubeState implements Printable {

	constructor(readonly spec: CubeSpecification,
		readonly permutations: ReadonlyArray<ReadonlyArray<number>>,
		readonly reorientations: ReadonlyArray<ReadonlyArray<number>>) {
		//TODO: Validate input data? (Permutations.length=3, Permutation[type].length=CubicalLocation.count(type), Permutation[type] is a permutation i.e. contains any value once.... ) 
	}

	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	public toString(): string {
		return 'Corner Permutations:   [' + this.permutations[0].toString() + "] \n" +
			'Edge   Permutations:   [' + this.permutations[1].toString() + "] \n" +
			'Face   Permutations:   [' + this.permutations[2].toString() + "] \n" +
			'Corner Reorientations: [' + this.reorientations[0].toString() + "] \n" +
			'Edge   Reorientations: [' + this.reorientations[1].toString() + "] \n" +
			'Face   Reorientations: [' + this.reorientations[2].toString() + "] \n";
	}

	static snapshotFromCubicals(spec: CubeSpecification, cubicals: ReadonlyArray<ReadonlyCubical>): CubeState {

		const permutations = [new Array<number>(), new Array<number>(), new Array<number>()];
		const orientations = [new Array<number>(), new Array<number>(), new Array<number>()];
		let logstring = 'getState: ';
		for (const cubical of cubicals) {
			permutations[cubical.type.dimensionsCount][CubeState.indexFromLocation(spec, cubical.initialLocation)] = CubeState.indexFromLocation(spec, cubical.location)
			orientations[cubical.type.dimensionsCount][CubeState.indexFromLocation(spec, cubical.initialLocation)] = CubeState.reorientationNumberFromMatrix(cubical.initialLocation.part, cubical.location.part, cubical.orientation);
			logstring = logstring + ' At[' + CubeState.indexFromLocation(spec, cubical.initialLocation).toString() + ']' + cubical.toString() + " ";
		}

		logstring = logstring + permutations.toString() + orientations.toString();
		//console.log(logstring);

		return new CubeState(spec, permutations, orientations);

	}

	restoreIntoCubicals(cubicals: ReadonlyArray<Cubical>): void {

		for (const cubical of cubicals) {
			const index = CubeState.indexFromLocation(this.spec, cubical.initialLocation);
			const location = CubeState.indexToLocation(this.spec, this.permutations[cubical.type.dimensionsCount][index], cubical.type);
			//ÄTSCH, da war der Fehler ;-) 
			//const orientation = CubeState.reorientationNumberToMatrix(cubical.initialLocation.part, cubical.location.part, this.reorientations[cubical.type.dimensionsCount][index]);
			const orientation = CubeState.reorientationNumberToMatrix(cubical.initialLocation.part, location.part, this.reorientations[cubical.type.dimensionsCount][index]);
			cubical.beam(location, orientation);		
		}
	}

	/** Index of a CubicalLocations by type. The format is cubePartIndex*(N-2)^d+(remainingCoordinate[0]-1)*(N-2)^(d-1)...
	 * 
	 * @param spec 
	 * @param CubicalLocation 
	 */
	//TODO: Why public?
	//ANSWER: So in inspection I am free to switch between different address systems for locations (coordinate, index, on cubepart)
	static indexFromLocation(spec: CubeSpecification, cubeLocation: CubicalLocation): number {
		let result = cubeLocation.part.index;
		//encodes the remainingCoordinates 0...(N-3)^d, since each remainingCoordinate is 1...N-2
		for (let remainingCoordinate of cubeLocation.coordinatesInPartDirections) {
			result = (remainingCoordinate - 1) + result * (spec.edgeLength - 2);
		}
		return result;
	}

	/** CubeLocation with a given index by type. The format is cubePartIndex*(N-2)^d+remainingCoordinate[0]*(N-2)^(d-1)...
	 * 
	 */
	//TODO: Why static?
	//TODO: Why public?
	static indexToLocation(spec: CubeSpecification, indexByType: number, type: CubePartType): CubicalLocation {
		let remainingCoordinates = new Array<number>();
		for (let i = type.dimensionsCount - 1; i >= 0; i--) {
			remainingCoordinates[i] = (indexByType % (spec.edgeLength - 2)) + 1;
			indexByType = Math.floor(indexByType / (spec.edgeLength - 2));
		}
		let cubePart: CubePart = CubePart.getByTypeAndIndex(type, indexByType);
		return CubicalLocation.fromPartAndCoordinatesInPart(spec, cubePart, remainingCoordinates);
	}

	/** Returns a number 0....CubePart.normalVectors.length-1 that expresses how the Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	 */
	private static reorientationNumberFromMatrix(initialPart: CubePart, newPart: CubePart, orientation: CubicalOrientation): number {
		let logstring = 'reorientationNumberFromMatrix ' + initialPart.toString() + "->" + newPart.toString() + "|" + orientation.matrix.toString() + "\n";
		let transformedNormalVectors = new Array<CubeCoordinates>();
		let newlocationNormalVectors = new Array<CubeCoordinates>();
		if (initialPart.type != newPart.type) throw new Error('CubeParts not matching type')
		for (let i: number = 0; i < initialPart.getNeighbouringAndAdditionalFaces().length; i++) {
			transformedNormalVectors.push(initialPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector().transformAroundZero(orientation.matrix));
			newlocationNormalVectors.push(newPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			logstring = logstring + '(' + transformedNormalVectors[i].toString() + '/' + newlocationNormalVectors[i].toString() + ')';
		}
		//console.log(logstring);
		//Find out how the two vector pairs are shifted in comparisment
		//Just very different for Face (one one normal vector) and others (no additional vector)
		if (initialPart.type == CubePartType.FACE) {
			for (let reorientationNumber = 0; reorientationNumber < 4; reorientationNumber++) {
				if (deepEqual(transformedNormalVectors, newlocationNormalVectors)) return reorientationNumber;
				//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
				transformedNormalVectors[1] = transformedNormalVectors[1].crossProduct(transformedNormalVectors[0]);
			}
		}
		else {
			for (let reorientationNumber = 0; reorientationNumber < newPart.getNeighbouringAndAdditionalFaces().length; reorientationNumber++) {
				if (deepEqual(transformedNormalVectors, newlocationNormalVectors)) return reorientationNumber;
				//shift index by 1
				transformedNormalVectors = transformedNormalVectors.concat(transformedNormalVectors.splice(0, 1));
			}
		}
		throw new Error('Cannot bring the sets of normal and additional vectors to coincide (cube with illegal reorientations to start with?)');
	}

	/** Takes a number 0....CubePart.normalVectors.length-1 and finds a Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	* Because Face has four normal vectors (instead of one), the function is unique
	*/
	//TODO: Why static?
	private static reorientationNumberToMatrix(initialPart: CubePart, newPart: CubePart, reorientationNumber: number): CubicalOrientation {
		let logstring = 'reorientationNumberFromMatrix ' + initialPart.toString() + "->" + newPart.toString() + "|" + reorientationNumber.toString() + "\n";
		let initialLocationNormalVectors = new Array<CubeCoordinates>();
		let newLocationNormalVectors = new Array<CubeCoordinates>();
		if (initialPart.type != newPart.type) throw new Error('CubeParts not matching type')

		for (let i: number = 0; i < initialPart.getNeighbouringAndAdditionalFaces().length; i++) {
			initialLocationNormalVectors.push(initialPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			newLocationNormalVectors.push(newPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			logstring = logstring + '(' + initialLocationNormalVectors[i].toString() + '/' + newLocationNormalVectors[i].toString() + ')';
		}
		//console.log(logstring);


		//shift according to reorientationNumber
		if (initialPart.type == CubePartType.FACE) {
			//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
			for (let i = 0; i < reorientationNumber; i++) { initialLocationNormalVectors[1] = initialLocationNormalVectors[1].crossProduct(initialLocationNormalVectors[0]); }
		}
		else {
			//shift index
			initialLocationNormalVectors = initialLocationNormalVectors.concat(initialLocationNormalVectors.splice(0, reorientationNumber));
		}

		//Solve for matrix: It is enough to match the first one?
		switch (initialPart.type) {
			case CubePartType.CORNER: return new CubicalOrientation(Matrices.getTransitivityMatrix(initialLocationNormalVectors[0], initialLocationNormalVectors[1], initialLocationNormalVectors[2], newLocationNormalVectors[0], newLocationNormalVectors[1], newLocationNormalVectors[2]));
			case CubePartType.EDGE: return new CubicalOrientation(Matrices.getTransitivityOrthogonalMatrix(initialLocationNormalVectors[0], initialLocationNormalVectors[1], newLocationNormalVectors[0], newLocationNormalVectors[1]));
			case CubePartType.FACE: return new CubicalOrientation(Matrices.getTransitivityOrthogonalMatrix(initialLocationNormalVectors[0], initialLocationNormalVectors[1], newLocationNormalVectors[0], newLocationNormalVectors[1]));
			default: throw new Error(`Invalid type: ${initialPart.type}`);
		}
	}

}
