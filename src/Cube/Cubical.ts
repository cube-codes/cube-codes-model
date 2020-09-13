import { CubeSpecification, CubeCoordinates, CubeDimension } from "./CubeGeometry";
import { Matrix, inv} from "mathjs";
import { CubePartType, CubeFace, CubePart, CubePartTypes } from "./CubePart";
import { Cube } from "./Cube";
import deepEqual from "deep-equal";
import { Matrices } from "../Utilities/Matrices";

  /**
   * Wraps an orthogonal matrix that describes how the cubical is currently rotated around its center, in comparison to its standard location and orientation.
   */
export class CubicalOrientation {

	/** 
	 * The standard orientation
	 */
	static readonly IDENTITY: CubicalOrientation = new CubicalOrientation(Matrices.IDENTITY);

	constructor(readonly matrix: Matrix) {}

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
	static fromS4Element(permutation:Array<number>):CubicalOrientation {
		throw new Error('Not yet implemented');
	}
	
	/** 
	 * There are 24 rotations of the cube, these can be identified as group with the symmetric group S4, by observing how pairs of antipodal corners are permuted.
	 * 
	 * @param orientation An orientation 
	 */
	static toS4Element(orientation:CubicalOrientation):Array<number> {
		throw new Error('Not yet implemented');
	}

}

/** 
 * Immutable. Wraps a CubeCoordinate in the cube, which has recognized the containing CubePart (Corner, Edge, Face) and local coordinates (or thrown an error).
 * 
 */
export class CubicalLocation{

	cubePart:CubePart; 
	remainingDimensions:Array<CubeDimension>;
	remainingCoordinates:Array<number>;

	constructor(readonly spec: CubeSpecification, readonly coordinates: CubeCoordinates) {
		//console.log(coordinates.toString());
		this.coordinates=coordinates;
		this.remainingDimensions= new Array<CubeDimension>();
		this.remainingCoordinates=new Array<number>()
		let cubePartStartingPoint= new CubeCoordinates(0,0,0);
		
		//Go through all dimensions and see if the result is sharp 0 resp. max or if it is some value in between.
		const max=spec.edgeLength - 1;
		for (const dimension of CubeDimension.ALL) {	
			const coordinate=coordinates.getComponent(dimension);
			if (coordinate == max) {
				cubePartStartingPoint=cubePartStartingPoint.addAt(dimension,1);
			}
			else if  (coordinate == 0) {
				cubePartStartingPoint=cubePartStartingPoint.addAt(dimension,0); //redundant, but for completeness
			}
			else if (coordinate > 0 && coordinate < max) {
				this.remainingDimensions.push(dimension);
				this.remainingCoordinates.push(coordinate);
			}
			else if (coordinate < 0 || coordinate > max) {
				throw new Error('Coordinate outside of cube');
			}
		} 

		if (this.remainingDimensions.length==3) throw new Error('Coordinate inside of cube');
		this.cubePart=CubePart.fromCoordinates(this.remainingDimensions,cubePartStartingPoint);
	}

	/** Computes a CubicalLocation on given CubePart toghether with local coordinates. Used in CubicalLocation.getAll and IndexToLocation.fromIndex and possibly during cube inspection.
	 * 
	 */
	static fromCubePartAndRemainingCoordinates(spec:CubeSpecification,cubePart:CubePart, remainingCoordinates:Array<number>):CubicalLocation {
		if (cubePart.remainingDimensions.length!=remainingCoordinates.length) throw new Error('remainingCoordiantes have wrong length');
		let coordinates:CubeCoordinates=cubePart.startingPoint.multiply(spec.edgeLength-1);;
		for(let i=0; i<remainingCoordinates.length;i++) {
			coordinates=coordinates.addAt(cubePart.remainingDimensions[i],remainingCoordinates[i]);
		}
		//console.log(cubePart.toString()+coordinates.toString());
		return new CubicalLocation(spec,coordinates);
	}


	/**Constructs all cubical locations inside (i.e. ecluding lowerdimensional boundary) of a given Face/Edge/Corner
	 * essentially by covering all possibilities in the if-tree in the constructor
	 * 
	 * TODO LL Loop over remainingCoordinate[] depending on cubePart.type
	*/
	static getAll(spec:CubeSpecification,cubePart:CubePart):Array<CubicalLocation> {
		let result:Array<CubicalLocation>=new Array<CubicalLocation>();
		if(cubePart.type==CubePartType.CORNER) {
			let remainingCoordinates:Array<number>=[]; //only a single cubical for a given corner
			result.push(CubicalLocation.fromCubePartAndRemainingCoordinates(spec,cubePart, remainingCoordinates));
		} else if (cubePart.type==CubePartType.EDGE) {
			for(let remainingCoordinate0=1;remainingCoordinate0<spec.edgeLength-1;remainingCoordinate0++) {
				let remainingCoordinates:Array<number>=[remainingCoordinate0]; 
				result.push(CubicalLocation.fromCubePartAndRemainingCoordinates(spec,cubePart, remainingCoordinates));
			}
		} else if (cubePart.type==CubePartType.FACE) {
			for(let remainingCoordinate0=1;remainingCoordinate0<spec.edgeLength-1;remainingCoordinate0++) {
				for(let remainingCoordinate1=1;remainingCoordinate1<spec.edgeLength-1;remainingCoordinate1++) {
					let remainingCoordinates:Array<number>=[remainingCoordinate0, remainingCoordinate1]; 
					result.push(CubicalLocation.fromCubePartAndRemainingCoordinates(spec,cubePart, remainingCoordinates));				}
			}
		} 
		return result;
	}

	isIn(cubePart: CubePart): boolean {
		//TODO: Implement: ATTENTION: THIS IS NOT SIMPLY TO ASK WHETHER this.cubePart == cubePart. Because a EdgeCubical is Part of 2 faces but cubePart is a CubeEdge ...
		throw new Error('Implement');
	}

	isAlong(dimension: CubeDimension): boolean {
	throw new Error('Implement');
	}

	rotate(dimension: CubeDimension): CubicalLocation {
		return new CubicalLocation(this.spec, this.coordinates.rotate(this.spec, dimension));
	}


}	
export interface CubicalSolvedCondition {

	(cubical: ReadonlyCubical): boolean

}

export interface ReadonlyCubical {

	readonly cube: Cube

	readonly initialLocation: CubicalLocation

	readonly location: CubicalLocation

	readonly orientation: CubicalOrientation

	isSolved(customCondition: CubicalSolvedCondition): boolean

}

export class Cubical implements ReadonlyCubical{

	#location: CubicalLocation;

	#orientation: CubicalOrientation;

	constructor(
		readonly cube: Cube,
		readonly initialLocation:CubicalLocation,
		location?: CubicalLocation,
		orientation?: CubicalOrientation) {
		
		if(location) this.#location = location;
		else this.#location=initialLocation;
		
		if(orientation) this.#orientation = orientation;
		else this.#orientation=CubicalOrientation.IDENTITY;

		if (!deepEqual(this.cube.spec, this.initialLocation.spec)) throw new Error(`Invalid spec of intial location: ${initialLocation.spec}`);
		//TODO LL if (!deepEqual(this.cube.spec, this.#location.spec)) throw new Error(`Invalid spec of location: ${location.spec}`);
	}

	static fromInitialLocation(cube: Cube, initialLocation:CubicalLocation):Cubical {
		return new Cubical(cube, initialLocation, initialLocation, CubicalOrientation.IDENTITY);
	}

	get location(): CubicalLocation {
		return this.#location;
	}

	set location(location:CubicalLocation) {
		this.#location=location;
	}

	get orientation(): CubicalOrientation {
		return this.#orientation;
	}

	set orientation(orientation:CubicalOrientation) {
		this.#orientation=orientation;
	}

	getType():CubePartType {
		if (this.initialLocation.cubePart.type!=this.#location.cubePart.type) throw new Error('locations have different cubeParts (something went wrong in moves)');
		return this.initialLocation.cubePart.type; 
	}

	isSolved(customCondition?: CubicalSolvedCondition): boolean {
		const condition: CubicalSolvedCondition = customCondition ?? this.cube.solvedCondition;
		return condition.call(undefined, this);
	}

	rotate(dimension: CubeDimension): void {
		this.#location = this.#location.rotate(dimension);
		this.#orientation = this.#orientation.rotate(dimension);
	}

	/** Computes, which initial face (color) is shown if one looks at the cube at the new location on some face.
	 * 
	 * @param cubeFace The face from which we look at the cubical
	 */
	getColorShownOnSomeFace(cubeFace:CubeFace):CubeFace {
		this.location.cubePart.isContainedInFace(cubeFace); // just validates the request
		let result:CubeFace=CubeFace.fromNormalVector(cubeFace.getNormalVector().transformAroundZero(inv(this.orientation.matrix)));
		this.initialLocation.cubePart.isContainedInFace(result); // just validates the result
		return result;
	}
	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	public toString(): string {
		return CubePartTypes.toString(this.getType()) + '('+ this.initialLocation.coordinates.toString()+'->'+this.location.coordinates.toString()+'|'+this.orientation.matrix.toString()+')';
	}
}
