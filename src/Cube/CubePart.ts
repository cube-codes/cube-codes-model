import { CubeCoordinates, CubeDimension, Printable, CubeSpecification } from "./CubeGeometry";

export class CubePartType implements Printable {

	private static readonly _all: Array<CubePartType> = new Array();

	static readonly CORNER: CubePartType = new CubePartType(0, 'CORNER');
	static readonly EDGE: CubePartType = new CubePartType(1, 'EDGE');
	static readonly FACE: CubePartType = new CubePartType(2, 'FACE');

	static getAll(): ReadonlyArray<CubePartType> {
		return this._all;
	}

	private constructor(readonly dimensionsCount: number, readonly name: string) {
		CubePartType._all.push(this);
	}

	toString(): string {
		return this.name;
	}

	countNormalVectors() {
		return 3 - this.dimensionsCount;
	}

	/** Numbering of the possible CubicalLocations of each type, depending on the cubes edgelength. To be used in CubeState and in random state generation and in strings
	 * 
	*/
	countLocations(spec: CubeSpecification): number {
		switch (this) {
			case CubePartType.CORNER:
				return 8;
			case CubePartType.EDGE:
				return 12 * (spec.edgeLength - 2);
			case CubePartType.FACE:
				return 6 * Math.pow(spec.edgeLength - 2, 2)
			default:
				throw new Error(`Invalid type: ${this}`);
		}
	}

}

/** 
 * CubeFaces are directions in which normal vectors point, in which cubicals show different stickers. Of course CubeFaces can be identified with CubeParts of type Face, but they have different roles.
 */
export class CubeFace implements Printable {

	private static readonly _all: Array<CubeFace> = new Array();
	private static readonly _allByNormalVector: Map<string, CubeFace> = new Map();

	static readonly FRONT: CubeFace = new CubeFace('FRONT', CubeDimension.Z, false);
	static readonly RIGHT: CubeFace = new CubeFace('RIGHT', CubeDimension.X, false);
	static readonly UP: CubeFace = new CubeFace('UP', CubeDimension.Y, false);
	static readonly BACK: CubeFace = new CubeFace('BACK', CubeDimension.Z, true);
	static readonly LEFT: CubeFace = new CubeFace('LEFT', CubeDimension.X, true);
	static readonly DOWN: CubeFace = new CubeFace('DOWN', CubeDimension.Y, true);

	static getAll(): ReadonlyArray<CubeFace> {
		return this._all;
	}

	static getByNormalVector(normalVector: CubeCoordinates): CubeFace {
		const item = this._allByNormalVector.get(normalVector.toId());
		if(item === undefined) throw new Error(`Invalid normal vector: ${normalVector}`);
		return item;
	}

	private constructor(readonly name: string, readonly dimension: CubeDimension, readonly backside: boolean) {
		CubeFace._all.push(this);
		CubeFace._allByNormalVector.set(this.getNormalVector().toId(), this);
	}

	get frontside(): boolean {
		return !this.backside;
	}

	toString(): string {
		return this.name;
	}

	/** The normal vector pointing outwards this face in coordinates */
	getNormalVector(): CubeCoordinates {
		if (!this.backside) {
			return CubeCoordinates.fromDimension(this.dimension, -1);
		} else {
			return CubeCoordinates.fromDimension(this.dimension, +1);
		}
	}
	
}

/**
 * A cube part is some starting point plus remaining (running) coordinates. They come in types CORNER, EDGE, FACE and have an associated string and index as alternative description.
 * The normal vectors are counterclockwise ordered, with some arbitrary initial direction (used in computing ReorientationNumbers in CubeState). Face has 4 instead of 1 normal vector to account for the internal orientation of a FaceCubical (Picture on the cube)... 
 * In this class we define all 8 Corners, 12 Edges, 6 Faces explicitly.
 */
//TODO: nextCorners, Edges, Faces find them automatically
//TODO: Why here CubeFace?? What with Edge and Corner?
//TODO: Why must the Corners/Edges/Faces be ordered and why this additional Neighbours
export class CubePart implements Printable {

	private static readonly _allByType: Map<CubePartType, Array<CubePart>> = new Map();
	private static readonly _allByOriginAndDirection: Map<string, CubePart> = new Map();

	static readonly DRF: CubePart = new CubePart(CubePartType.CORNER, 0, 'DRF', [CubeFace.DOWN, CubeFace.RIGHT, CubeFace.FRONT], [], CubeCoordinates.E_Y, [])
	static readonly DBR: CubePart = new CubePart(CubePartType.CORNER, 1, 'DBR', [CubeFace.DOWN, CubeFace.BACK, CubeFace.RIGHT], [], CubeCoordinates.E_YZ, [])
	static readonly UFR: CubePart = new CubePart(CubePartType.CORNER, 2, 'UFR', [CubeFace.UP, CubeFace.FRONT, CubeFace.RIGHT], [], CubeCoordinates.ZERO, [])
	static readonly URB: CubePart = new CubePart(CubePartType.CORNER, 3, 'URB', [CubeFace.UP, CubeFace.RIGHT, CubeFace.BACK], [], CubeCoordinates.E_Z, [])
	static readonly ULF: CubePart = new CubePart(CubePartType.CORNER, 4, 'ULF', [CubeFace.UP, CubeFace.LEFT, CubeFace.FRONT], [], CubeCoordinates.E_X, [])
	static readonly UBL: CubePart = new CubePart(CubePartType.CORNER, 5, 'UBL', [CubeFace.UP, CubeFace.BACK, CubeFace.LEFT], [], CubeCoordinates.E_XZ, [])
	static readonly DLB: CubePart = new CubePart(CubePartType.CORNER, 6, 'DLB', [CubeFace.DOWN, CubeFace.LEFT, CubeFace.BACK], [], CubeCoordinates.E_XYZ, [])
	static readonly DFL: CubePart = new CubePart(CubePartType.CORNER, 7, 'DFL', [CubeFace.DOWN, CubeFace.FRONT, CubeFace.LEFT], [], CubeCoordinates.E_XY, [])

	static readonly UF: CubePart = new CubePart(CubePartType.EDGE, 0, 'UF', [CubeFace.UP, CubeFace.FRONT], [], CubeCoordinates.ZERO, [CubeDimension.X])
	static readonly UR: CubePart = new CubePart(CubePartType.EDGE, 1, 'UR', [CubeFace.UP, CubeFace.RIGHT], [], CubeCoordinates.ZERO, [CubeDimension.Z])
	static readonly BU: CubePart = new CubePart(CubePartType.EDGE, 2, 'BU', [CubeFace.BACK, CubeFace.UP], [], CubeCoordinates.E_Z, [CubeDimension.X])
	static readonly LU: CubePart = new CubePart(CubePartType.EDGE, 3, 'LU', [CubeFace.LEFT, CubeFace.UP], [], CubeCoordinates.E_X, [CubeDimension.Z])
	static readonly LF: CubePart = new CubePart(CubePartType.EDGE, 4, 'LF', [CubeFace.LEFT, CubeFace.FRONT], [], CubeCoordinates.E_X, [CubeDimension.Y])
	static readonly FR: CubePart = new CubePart(CubePartType.EDGE, 5, 'FR', [CubeFace.FRONT, CubeFace.RIGHT], [], CubeCoordinates.ZERO, [CubeDimension.Y])
	static readonly RB: CubePart = new CubePart(CubePartType.EDGE, 6, 'RB', [CubeFace.RIGHT, CubeFace.BACK], [], CubeCoordinates.E_Z, [CubeDimension.Y])
	static readonly BL: CubePart = new CubePart(CubePartType.EDGE, 7, 'BL', [CubeFace.BACK, CubeFace.LEFT], [], CubeCoordinates.E_XZ, [CubeDimension.Y])
	static readonly FD: CubePart = new CubePart(CubePartType.EDGE, 8, 'FD', [CubeFace.FRONT, CubeFace.DOWN], [], CubeCoordinates.E_Y, [CubeDimension.X])
	static readonly RD: CubePart = new CubePart(CubePartType.EDGE, 9, 'RD', [CubeFace.RIGHT, CubeFace.DOWN], [], CubeCoordinates.E_Y, [CubeDimension.Z])
	static readonly DB: CubePart = new CubePart(CubePartType.EDGE, 10, 'DB', [CubeFace.DOWN, CubeFace.BACK], [], CubeCoordinates.E_YZ, [CubeDimension.X])
	static readonly DL: CubePart = new CubePart(CubePartType.EDGE, 11, 'DL', [CubeFace.DOWN, CubeFace.LEFT], [], CubeCoordinates.E_XY, [CubeDimension.Z])

	static readonly F: CubePart = new CubePart(CubePartType.FACE, 0, 'F', [CubeFace.FRONT], [CubeFace.RIGHT], CubeCoordinates.ZERO, [CubeDimension.X, CubeDimension.Y])
	static readonly R: CubePart = new CubePart(CubePartType.FACE, 1, 'R', [CubeFace.RIGHT], [CubeFace.FRONT], CubeCoordinates.ZERO, [CubeDimension.Y, CubeDimension.Z])
	static readonly U: CubePart = new CubePart(CubePartType.FACE, 2, 'U', [CubeFace.UP], [CubeFace.FRONT], CubeCoordinates.ZERO, [CubeDimension.X, CubeDimension.Z])
	static readonly B: CubePart = new CubePart(CubePartType.FACE, 3, 'B', [CubeFace.BACK], [CubeFace.RIGHT], CubeCoordinates.E_Z, [CubeDimension.X, CubeDimension.Y])
	static readonly L: CubePart = new CubePart(CubePartType.FACE, 4, 'L', [CubeFace.LEFT], [CubeFace.FRONT], CubeCoordinates.E_X, [CubeDimension.Y, CubeDimension.Z])
	static readonly D: CubePart = new CubePart(CubePartType.FACE, 5, 'D', [CubeFace.DOWN], [CubeFace.FRONT], CubeCoordinates.E_Y, [CubeDimension.X, CubeDimension.Z])

	static getByType(type: CubePartType): ReadonlyArray<CubePart> {
		const item = this._allByType.get(type);
		if(item === undefined) throw new Error(`Invalid type: ${type}`);
		return item;
	}

	static getByTypeAndIndex(type: CubePartType, index: number): CubePart {
		const item = this.getByType(type)[index];
		if(item === undefined) throw new Error(`Invalid index: ${index}`);
		return item;
	}

	static getByOriginAndDirections(origin: CubeCoordinates, directions: ReadonlyArray<CubeDimension>): CubePart {
		const item = this._allByOriginAndDirection.get(JSON.stringify([origin, directions]));
		if(item === undefined) throw new Error(`Invalid origin and directions: ${origin}, ${directions}`);
		return item;
	}

	protected constructor(
		readonly type: CubePartType,
		readonly index: number,
		readonly name: string,
		readonly neighbouringFaces: ReadonlyArray<CubeFace>, //in some fixed ordering 
		readonly additionalFaces: ReadonlyArray<CubeFace>, //to fix orientation or Face
		readonly origin: CubeCoordinates,
		readonly directions: ReadonlyArray<CubeDimension>) {
			if(!CubePart._allByType.has(type)) CubePart._allByType.set(type, new Array());
			(CubePart._allByType.get(type) as Array<CubePart>).push(this);
			CubePart._allByOriginAndDirection.set(JSON.stringify([origin, directions]), this);
			origin.ensureInteger();
		}

	toString(): string {
		return this.name;
	}

	//TODO: Implement
	isAdjectedTo(part: CubePart): boolean {
		throw new Error("Method not implemented.");
	}

	//TODO: What is this? Refactor
	getNeighbouringAndAdditionalFaces(): Array<CubeFace> {
		return this.neighbouringFaces.concat(this.additionalFaces);
	}

	/*//Should be put into some utility class
	static shiftToTheLeft(array:Array<CubeCoordinates>, times:number):Array<CubeCoordinates> {
		return array.concat(array.splice(0,times));
	}*/

	/**
	 * Returns an error if cubeFace is not a containing face, otherwise returns the index in the random ordering of the containingFaces fixed above.
	 * @param cubeFace 
	 */
	//TODO: What is this? Refactor
	isContainedInFace(cubeFace: CubeFace): number {
		for (let i = 0; i < this.neighbouringFaces.length; i++) {
			if (this.neighbouringFaces[i] == cubeFace) return i;
		}
		throw new Error('The cube part does not show this face (wrong normal vector for this location?)')
	}

}
