import { CubeSpecification, CubeCoordinates, CubeDimension } from "./CubeGeometry";
import { Arrays } from "../Utilities/Arrays";
import { Matrix } from "mathjs";
import { AbstractCubePart, CubePartType, CubeFace, CubeCorner, CubeEdge } from "./CubePart";
import { Cube } from "./Cube";
import deepEqual from "deep-equal";
import { Matrices } from "../Utilities/Matrices";

export class CubicalOrientation {

	static readonly IDENTITY: CubicalOrientation = new CubicalOrientation(Matrices.IDENTITY);

	constructor(readonly matrix: Matrix) {}

	rotate(dimension: CubeDimension): CubicalOrientation {
		return new CubicalOrientation(Matrices.rotateMatrix(this.matrix, dimension));
	}

}

export type CUBE_PART<T extends CubePartType> = AbstractCubePart<T> & (T extends CubePartType.CORNER ? CubeCorner : (T extends CubePartType.EDGE ? CubeEdge : (T extends CubePartType.FACE ? CubeFace : AbstractCubePart<T>)));
export type CUBICAL_LOCATION<T extends CubePartType> = AbstractCubicalLocation<T> & (T extends CubePartType.CORNER ? CornerCubicalLocation : (T extends CubePartType.EDGE ? EdgeCubicalLocation : (T extends CubePartType.FACE ? FaceCubicalLocation : AbstractCubicalLocation<T>)));

//TODO: Simon fragen wozu index???
//TODO: Hier gibt es 2 große Fälle:
/**
 * A) Alle Cubicals eines Cubes mit fromInitialIndex und fromIndex generieren lassen
 * B) location.rotate() verursacht, dass man this.fromCoordinates braucht und damit alle anderen from...
 */
export abstract class AbstractCubicalLocation<T extends CubePartType> {

	static countByType<T extends CubePartType>(spec: CubeSpecification, type: T): number {
		switch(type) {
			case CubePartType.CORNER:
				return 8; 
			case CubePartType.EDGE:
				return 12 * (spec.edgeLength - 2);
			case CubePartType.FACE:
				return 6 * Math.pow(spec.edgeLength - 2, 2)
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	}

	constructor(readonly spec: CubeSpecification, readonly index: number, readonly cubePart: CUBE_PART<T>, readonly coordinates: CubeCoordinates) {
		if (!Number.isInteger(index) || index < 0 || index >= this.countByType()) throw new Error(`Invalid index: ${index}`);
	}

	static fromIndex<T extends CubePartType>(spec: CubeSpecification, type: T, index: number): CUBICAL_LOCATION<T> {
		switch(type) {
			case CubePartType.CORNER:
				return new CornerCubicalLocation(spec, index) as any; 
			case CubePartType.EDGE:
				return new EdgeCubicalLocation(spec, index) as any;
			case CubePartType.FACE:
				return new FaceCubicalLocation(spec, index) as any;
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	}

	abstract fromCoordinates(coordinates: CubeCoordinates): CUBICAL_LOCATION<T>;
	
	get type(): T {
		return this.cubePart.type;
	}

	get neighbouringFaces(): ReadonlyArray<CubeFace> {
		return this.cubePart.neigbouringFaces;
	}
	
	countByType(): number {
		return AbstractCubicalLocation.countByType(this.spec, this.type);
	}

	isIn(cubePart: AbstractCubePart<any>): boolean {
		//TODO: Implement: ATTENTION: THIS IS NOT SIMPLY TO ASK WHETHER this.cubePart == cubePart. Because a EdgeCubical is Part of 2 faces but cubePart is a CubeEdge ...
		throw new Error('Implement');
	}

	abstract isAlong(dimension: CubeDimension): boolean;

	isANormalVector(normalVector: CubeCoordinates): boolean {
		return this.neighbouringFaces.some(function (f) { return deepEqual(f.getNormalVector(), normalVector); });
	}

	rotate(dimension: CubeDimension): CUBICAL_LOCATION<T> {
		return this.fromCoordinates(this.coordinates.rotate(this.spec, dimension));
	}
	
}

export class CornerCubicalLocation extends AbstractCubicalLocation<CubePartType.CORNER> {

	constructor(spec: CubeSpecification, index: number) {
		const cubePart: CubeCorner = CubeCorner.fromIndex(index);
		const coordinates = cubePart.coordinates.multiply(spec.edgeLength - 1);
		super(spec, index, cubePart, coordinates);
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): CornerCubicalLocation {
		return new CornerCubicalLocation(spec, CubeCorner.fromCoordinates(coordinates.divide(spec.edgeLength - 1)).index);
	}

	//TODO: Simon fragen wozu
	static fromCorner(spec: CubeSpecification, cubeCorner: CubeCorner): CornerCubicalLocation {
		return new CornerCubicalLocation(spec, cubeCorner.index);
	}

	fromCoordinates(coordinates: CubeCoordinates): CornerCubicalLocation {
		return CornerCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	isAlong(dimension: CubeDimension): boolean {
		return true;
	}

	//TODO: Simon fragen wozu
	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.countByType(spec, CubePartType.CORNER)).map(i => i + '=' + (new this(spec, i)).coordinates).join(' ');
	}

}

export class EdgeCubicalLocation extends AbstractCubicalLocation<CubePartType.EDGE> {

	//TODO: Simon fragen wozu
	readonly lastCoordinate: number;

	constructor(spec: CubeSpecification, index: number) {
		const cubePart: CubeEdge = CubeEdge.fromIndex(Math.floor(index / (spec.edgeLength - 2)));
		const lastCoordinate = (index % (spec.edgeLength - 2)) + 1;
		const coordinates = cubePart.coordinates.multiply(spec.edgeLength - 1).add(CubeCoordinates.fromDimension(cubePart.dimension, lastCoordinate));
		super(spec, index, cubePart, coordinates);
		this.lastCoordinate = lastCoordinate;
	}

	//TODO: Simon fragen wozu
	static fromEdgeAndCoordinate(spec: CubeSpecification, cubeEdge: CubeEdge, lastCoordinate: number): EdgeCubicalLocation {
		return new EdgeCubicalLocation(spec, cubeEdge.index * (spec.edgeLength - 2) + (lastCoordinate - 1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): EdgeCubicalLocation {
		//console.log(coordinates.toString());
		let dimension: CubeDimension | undefined = undefined;
		let lastCoordinate: number | undefined = undefined;
		let edgeCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension = CubeDimension.X;
			lastCoordinate = coordinates.x;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension !== undefined) throw new Error('Coordinate of MidCubicle or inside cube');
			dimension = CubeDimension.Y;
			lastCoordinate = coordinates.y;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Y, 0);
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension !== undefined) throw new Error('Coordinate of MidCubicle or inside cube');
			dimension = CubeDimension.Z;
			lastCoordinate = coordinates.z;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Z, 0);
		}
		if (dimension === undefined) throw new Error('Coordinate of CornerCubicle');
		const cubeEdge = CubeEdge.fromCoordinates(dimension, edgeCoordinates.divide(spec.edgeLength - 1));
		//console.log(cubeEdge.index);
		//console.log(lastCoordinate);
		if (lastCoordinate === undefined) throw new Error('Should not happen'); //TODO: Mit Simon besprechen
		return EdgeCubicalLocation.fromEdgeAndCoordinate(spec, cubeEdge, lastCoordinate);
	}

	fromCoordinates(coordinates: CubeCoordinates): EdgeCubicalLocation {
		return EdgeCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	isAlong(dimension: CubeDimension): boolean {
		return dimension === this.cubePart.dimension;
	}

	//TODO: Simon fragen wozu
	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.countByType(spec, CubePartType.EDGE)).map(i => i + '=' + (new this(spec, i)).coordinates.toString()).join(' ');
	}

}

export class FaceCubicalLocation extends AbstractCubicalLocation<CubePartType.FACE> {

	//TODO: Simon fragen wozu
	readonly coordinate1: number;
	
	//TODO: Simon fragen wozu
	readonly coordinate2: number;

	constructor(spec: CubeSpecification, index: number) {
		const cubePart: CubeFace = CubeFace.fromIndex(Math.floor(index / ((spec.edgeLength - 2) * (spec.edgeLength - 2))));
		const twoCoordinates = (index % ((spec.edgeLength - 2) * (spec.edgeLength - 2)));
		const coordinate1 = Math.floor(twoCoordinates / (spec.edgeLength - 2)) + 1;
		const coordinate2 = (twoCoordinates % (spec.edgeLength - 2)) + 1;
		const coordinates = cubePart.coordinates.multiply(spec.edgeLength - 1).add(CubeCoordinates.fromDimension(cubePart.dimension1, coordinate1)).add(CubeCoordinates.fromDimension(cubePart.dimension2, coordinate2));
		super(spec, index, cubePart, coordinates);
		this.coordinate1 = coordinate1;
		this.coordinate2 = coordinate2;
	}

	//TODO: Simon fragen wozu
	static fromFaceAndCoordinate(spec: CubeSpecification, cubeFace: CubeFace, coordinate1: number, coordinate2: number): FaceCubicalLocation {
		return new FaceCubicalLocation(spec, cubeFace.index * (spec.edgeLength - 2) * (spec.edgeLength - 2) + (coordinate1 - 1) * (spec.edgeLength - 2) + (coordinate2 - 1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): FaceCubicalLocation {
		let dimension1: CubeDimension | undefined = undefined;
		let dimension2: CubeDimension | undefined = undefined;
		let coordinate1: number | undefined = undefined;
		let coordinate2: number | undefined = undefined;
		let faceCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension1 = CubeDimension.X;
			coordinate1 = coordinates.x;
			faceCoordinates = faceCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension1 !== undefined) {
				dimension2 = CubeDimension.Y;
				coordinate2 = coordinates.y;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Y, 0);
			} else {
				dimension1 = CubeDimension.Y;
				coordinate1 = coordinates.y;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Y, 0);
			}
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension2 !== undefined) throw 'Coordinate  inside cube';
			if (dimension1 !== undefined) {
				dimension2 = CubeDimension.Z;
				coordinate2 = coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			} else {
				dimension1 = CubeDimension.Z;
				coordinate1 = coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			}
		}
		if (dimension2 === undefined) throw new Error('Coordinate of CornerCubicle or EdgeCubical');
		if (dimension1 === undefined) throw new Error('Should not happen'); //TODO: Mit Simon besprechen
		const cubeFace = CubeFace.fromCoordinates(dimension1, dimension2, faceCoordinates.divide(spec.edgeLength - 1));
		if (coordinate1 === undefined) throw new Error('Should not happen'); //TODO: Mit Simon besprechen
		if (coordinate2 === undefined) throw new Error('Should not happen'); //TODO: Mit Simon besprechen
		return FaceCubicalLocation.fromFaceAndCoordinate(spec, cubeFace, coordinate1, coordinate2);
	}

	fromCoordinates(coordinates: CubeCoordinates): FaceCubicalLocation {
		return FaceCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	isAlong(dimension: CubeDimension): boolean {
		return dimension === this.cubePart.dimension1 || dimension === this.cubePart.dimension2;
	}

	//TODO: Simon fragen wozu
	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.countByType(spec, CubePartType.FACE)).map(i => i + '=' + (new this(spec, i)).coordinates.toString()).join(' ');
	}

}

export interface CubicalSolvedCondition {

	(cubical: ReadonlyCubical<any>): boolean

}

export interface ReadonlyCubical<T extends CubePartType> {

	readonly cube: Cube

	readonly initialLocation: CUBICAL_LOCATION<T>

	readonly location: CUBICAL_LOCATION<T>

	readonly orientation: CubicalOrientation

	readonly type: T

	isSolved(customCondition?: CubicalSolvedCondition): boolean

}

export class Cubical<T extends CubePartType> implements ReadonlyCubical<T> {

	#location: CUBICAL_LOCATION<T>;

	#orientation: CubicalOrientation;

	constructor(
		readonly cube: Cube,
		readonly initialLocation: CUBICAL_LOCATION<T>,
		location: CUBICAL_LOCATION<T>,
		orientation: CubicalOrientation) {
		if (!deepEqual(this.cube.spec, initialLocation.spec)) throw new Error(`Invalid spec of intial location: ${initialLocation.spec}`);
		if (!deepEqual(this.cube.spec, location.spec)) throw new Error(`Invalid spec of location: ${location.spec}`);
		this.#location = location;
		this.#orientation = orientation;
	}

	static fromInitialIndex<T extends CubePartType>(cube: Cube, type: T, index: number): Cubical<T> {
		const initialLocation: CUBICAL_LOCATION<T> = AbstractCubicalLocation.fromIndex(cube.spec, type, index);
		return new Cubical(cube, initialLocation, initialLocation, CubicalOrientation.IDENTITY);
	}

	get location(): CUBICAL_LOCATION<T> {
		return this.#location;
	}

	get orientation(): CubicalOrientation {
		return this.#orientation;
	}

	get type(): T {
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

}