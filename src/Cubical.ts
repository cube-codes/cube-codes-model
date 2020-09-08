import { CubeSpecification, CubeCoordinates, CubeDimension, Matrices } from "./CubeGeometry";
import { Arrays } from "./Arrays";
import { Matrix } from "mathjs";
import { AbstractCubePart, CubePartType, CubeFace, CubeCorner, CubeEdge } from "./CubePart";
var deepEqual = require('deep-equal')

export class CubicalOrientation {

	static readonly IDENTITY: CubicalOrientation = new CubicalOrientation(Matrices.IDENTITY);

	constructor(readonly matrix: Matrix) {}

	rotate(dimension: CubeDimension): CubicalOrientation {
		return new CubicalOrientation(Matrices.rotateMatrix(this.matrix, dimension));
	}

}

export abstract class CubicalLocation<SELF extends CubicalLocation<SELF, any>, P extends AbstractCubePart> {

	constructor(readonly spec: CubeSpecification, readonly index: number, readonly cubePart: P, readonly coordinates: CubeCoordinates) {
		if (!Number.isInteger(index) || index < 0 || index >= this.getIndexLength()) throw new Error(`Invalid index: ${index}`);
	}

	abstract fromCoordinates(coordinates: CubeCoordinates): SELF;
	
	get type(): CubePartType {
		return this.cubePart.type;
	}

	get neighbouringFaces(): ReadonlyArray<CubeFace> {
		return this.cubePart.neigbouringFaces;
	}

	abstract getIndexLength(): number;

	isANormalVector(normalVector: CubeCoordinates): boolean {
		return this.neighbouringFaces.some(function (f) { return deepEqual(f.getNormalVector(), normalVector); });
	}

	rotate(dimension: CubeDimension): SELF {
		return this.fromCoordinates(this.coordinates.rotate(this.spec, dimension));
	}
	
}

export class CornerCubicalLocation extends CubicalLocation<CornerCubicalLocation, CubeCorner> {

	constructor(spec: CubeSpecification, index: number) {
		const cubePart: CubeCorner = CubeCorner.fromIndex(index);
		const coordinates = cubePart.coordinates.multiply(spec.edgeLength - 1);
		super(spec, index, cubePart, coordinates);
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): CornerCubicalLocation {
		return new CornerCubicalLocation(spec, CubeCorner.fromCoordinates(coordinates.divide(spec.edgeLength - 1)).index);
	}

	static fromCorner(spec: CubeSpecification, cubeCorner: CubeCorner): CornerCubicalLocation {
		return new CornerCubicalLocation(spec, cubeCorner.index);
	}

	fromCoordinates(coordinates: CubeCoordinates): CornerCubicalLocation {
		return CornerCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	static getIndexLength(spec: CubeSpecification): number {
		return 8;
	}
	
	getIndexLength(): number {
		return CornerCubicalLocation.getIndexLength(this.spec);
	}

	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.getIndexLength(spec)).map(i => i + '=' + (new this(spec, i)).coordinates).join(' ');
	}

}

export class EdgeCubicalLocation extends CubicalLocation<EdgeCubicalLocation, CubeEdge> {

	readonly lastCoordinate: number;

	constructor(spec: CubeSpecification, index: number) {
		const cubePart: CubeEdge = CubeEdge.fromIndex(Math.floor(index / (spec.edgeLength - 2)));
		const lastCoordinate = (index % (spec.edgeLength - 2)) + 1;
		const coordinates = cubePart.coordinates.multiply(spec.edgeLength - 1).add(CubeCoordinates.fromDimension(cubePart.dimension, lastCoordinate));
		super(spec, index, cubePart, coordinates);
		this.lastCoordinate = lastCoordinate;
	}

	static fromEdgeAndCoordinate(spec: CubeSpecification, cubeEdge: CubeEdge, lastCoordinate: number): EdgeCubicalLocation {
		return new EdgeCubicalLocation(spec, cubeEdge.index * (spec.edgeLength - 2) + (lastCoordinate - 1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): EdgeCubicalLocation {
		//console.log(coordinates.toString());
		let dimension: CubeDimension = null;
		let lastCoordinate: number = null;
		let edgeCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension = CubeDimension.X;
			lastCoordinate = coordinates.x;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension !== null) throw new Error('Coordinate of MidCubicle or inside cube');
			dimension = CubeDimension.Y;
			lastCoordinate = coordinates.y;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Y, 0);
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension !== null) throw new Error('Coordinate of MidCubicle or inside cube');
			dimension = CubeDimension.Z;
			lastCoordinate = coordinates.z;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Z, 0);
		}
		if (dimension === null) throw new Error('Coordinate of CornerCubicle');
		const cubeEdge = CubeEdge.fromCoordinates(dimension, edgeCoordinates.divide(spec.edgeLength - 1));
		//console.log(cubeEdge.index);
		//console.log(lastCoordinate);
		return EdgeCubicalLocation.fromEdgeAndCoordinate(spec, cubeEdge, lastCoordinate);
	}

	fromCoordinates(coordinates: CubeCoordinates): EdgeCubicalLocation {
		return EdgeCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	static getIndexLength(spec: CubeSpecification): number {
		return 12 * (spec.edgeLength - 2);
	}
	
	getIndexLength(): number {
		return EdgeCubicalLocation.getIndexLength(this.spec);
	}

	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.getIndexLength(spec)).map(i => i + '=' + (new this(spec, i)).coordinates.toString()).join(' ');
	}

}

export class FaceCubicalLocation extends CubicalLocation<FaceCubicalLocation, CubeFace> {

	readonly coordinate1: number;
	
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

	static fromFaceAndCoordinate(spec: CubeSpecification, cubeFace: CubeFace, coordinate1: number, coordinate2: number): FaceCubicalLocation {
		return new FaceCubicalLocation(spec, cubeFace.index * (spec.edgeLength - 2) * (spec.edgeLength - 2) + (coordinate1 - 1) * (spec.edgeLength - 2) + (coordinate2 - 1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates): FaceCubicalLocation {
		let dimension1: CubeDimension = null;
		let dimension2: CubeDimension = null;
		let coordinate1: number = null;
		let coordinate2: number = null;
		let faceCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension1 = CubeDimension.X;
			coordinate1 = coordinates.x;
			faceCoordinates = faceCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw new Error('Coordinate outside of cube');
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension1 !== null) {
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
			if (dimension2 !== null) throw 'Coordinate  inside cube';
			if (dimension1 !== null) {
				dimension2 = CubeDimension.Z;
				coordinate2 = coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			} else {
				dimension1 = CubeDimension.Z;
				coordinate1 = coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			}
		}
		if (dimension2 === null) throw new Error('Coordinate of CornerCubicle or EdgeCubical');
		const cubeFace = CubeFace.fromCoordinates(dimension1, dimension2, faceCoordinates.divide(spec.edgeLength - 1));
		return FaceCubicalLocation.fromFaceAndCoordinate(spec, cubeFace, coordinate1, coordinate2);
	}

	fromCoordinates(coordinates: CubeCoordinates): FaceCubicalLocation {
		return FaceCubicalLocation.fromCoordinates(this.spec, coordinates);
	}

	static getIndexLength(spec: CubeSpecification): number {
		return 6 * (spec.edgeLength - 2) * (spec.edgeLength - 2)
	}
	
	getIndexLength(): number {
		return FaceCubicalLocation.getIndexLength(this.spec);
	}

	static overviewToString(spec: CubeSpecification): string {
		return Arrays.integerRangeToExclusivly(this.getIndexLength(spec)).map(i => i + '=' + (new this(spec, i)).coordinates.toString()).join(' ');
	}

}

export interface ReadonlyCubical<L extends CubicalLocation<L, any>> {

	readonly spec: CubeSpecification;

	readonly initialLocation: L;

	readonly location: L;

	readonly orientation: CubicalOrientation;

}

export interface ReadonlyCornerCubical extends ReadonlyCubical<CornerCubicalLocation> {}

export interface ReadonlyEdgeCubical extends ReadonlyCubical<EdgeCubicalLocation> {}

export interface ReadonlyFaceCubical extends ReadonlyCubical<FaceCubicalLocation> {}

export abstract class AbstractCubical<L extends CubicalLocation<L, any>> implements ReadonlyCubical<L> {

	#location: L;

	#orientation: CubicalOrientation;

	constructor(
		readonly spec: CubeSpecification,
		readonly initialLocation: L,
		location: L,
		orientation: CubicalOrientation) {
		this.#location = location;
		this.#orientation = orientation;
	}

	get location(): L {
		return this.#location;
	}

	get orientation(): CubicalOrientation {
		return this.#orientation;
	}

	rotate(dimension: CubeDimension): void {
		this.#location = this.#location.rotate(dimension),
		this.#orientation = this.#orientation.rotate(dimension);
	}

}

export class CornerCubical extends AbstractCubical<CornerCubicalLocation> implements ReadonlyCornerCubical {

	static fromInitialLocation(initialLocation: CornerCubicalLocation): CornerCubical {
		return new CornerCubical(initialLocation.spec, initialLocation, initialLocation, CubicalOrientation.IDENTITY);
	}

}

export class EdgeCubical extends AbstractCubical<EdgeCubicalLocation> implements ReadonlyEdgeCubical {

	static fromInitialLocation(initialLocation: EdgeCubicalLocation): EdgeCubical {
		return new EdgeCubical(initialLocation.spec, initialLocation, initialLocation, CubicalOrientation.IDENTITY);
	}

}

export class FaceCubical extends AbstractCubical<FaceCubicalLocation> implements ReadonlyFaceCubical {

	static fromInitialLocation(initialLocation: FaceCubicalLocation): FaceCubical {
		return new FaceCubical(initialLocation.spec, initialLocation, initialLocation, CubicalOrientation.IDENTITY);
	}

}