import { CubeCoordinates, CubeDimension } from "./CubeGeometry";
import deepEqual from "deep-equal";

export enum CubePartType {
	CORNER = 0,
	EDGE = 1,
	FACE = 2
}

export abstract class CubePartTypes {
	
	static readonly ALL: ReadonlyArray<CubePartType> = [CubePartType.CORNER, CubePartType.EDGE, CubePartType.FACE];

	static countNormalVectors(type:CubePartType) {
		return 3-type;
		/*switch(type) {
			case CubePartType.CORNER: return 3;
			case CubePartType.EDGE: return 2;
			case CubePartType.FACE: return 1;
			default: throw new Error('Invalid type');
		}*/
	}

	static toString(type:CubePartType) {
		switch(type) {
			case CubePartType.CORNER: return 'CORNER';
			case CubePartType.EDGE: return 'EDGE';
			case CubePartType.FACE: return 'FACE';
			default: throw new Error('Invalid type');
		}
	}
}

/** 
 * CubeFaces are directions in which normal vectors point, in which cubicals show different stickers. Of course CubeFaces can be identified with CubeParts of type Face, but they have different roles.
 */
export class CubeFace {

	static readonly FRONT: CubeFace = new CubeFace(CubeDimension.Z, false);
	static readonly RIGHT: CubeFace = new CubeFace(CubeDimension.X, false);
	static readonly UP: CubeFace = new CubeFace(CubeDimension.Y, false);
	static readonly BACK: CubeFace = new CubeFace(CubeDimension.Z, true);
	static readonly LEFT: CubeFace = new CubeFace(CubeDimension.X, true);
	static readonly DOWN: CubeFace = new CubeFace(CubeDimension.Y, true);

	static readonly ALL:Array<CubeFace>= [CubeFace.FRONT,CubeFace.RIGHT,CubeFace.UP, CubeFace.BACK,CubeFace.LEFT, CubeFace.DOWN];

	protected constructor(readonly dimension:CubeDimension,readonly backside:boolean) { 

	}

	/** The normal vector pointing outwards this face in coordinates */
	getNormalVector():CubeCoordinates {
		if (!this.backside) return new CubeCoordinates(0,0,0).addAt(this.dimension,-1);
		else return new CubeCoordinates(0,0,0).addAt(this.dimension,+1);
	}

	static fromNormalVector(normalVector:CubeCoordinates):CubeFace {
		if (normalVector.x==0 && normalVector.y==0 && normalVector.z==-1) return CubeFace.FRONT;
		if (normalVector.x==-1 && normalVector.y==0 && normalVector.z==0) return CubeFace.RIGHT;
		if (normalVector.x==0 && normalVector.y==-1 && normalVector.z==0) return CubeFace.UP;
		if (normalVector.x==0 && normalVector.y==0 && normalVector.z==+1) return CubeFace.BACK;
		if (normalVector.x==+1 && normalVector.y==0 && normalVector.z==0) return CubeFace.LEFT;
		if (normalVector.x==0 && normalVector.y==+1 && normalVector.z==0) return CubeFace.DOWN;
		throw new Error ('Not a valid normal vector appearing in a cube');

	}
}

/**
 * A cube part is some starting point plus remaining (running) coordinates. They come in types CORNER, EDGE, FACE and have an associated string and index as alternative description.
 * The normal vectors are counterclockwise ordered, with some arbitrary initial direction (used in computing ReorientationNumbers in CubeState). Face has 4 instead of 1 normal vector to account for the internal orientation of a FaceCubical (Picture on the cube)... 
 * In this class we define all 8 Corners, 12 Edges, 6 Faces explicitly.
 */
export class CubePart {

	protected constructor(readonly type: CubePartType, readonly index: number, readonly name: string, 
		readonly neighbouringFaces: ReadonlyArray<CubeFace>, //in some fixed ordering 
		readonly additionalFaces: ReadonlyArray<CubeFace>, //to fix orientation or Face
		readonly remainingDimensions:ReadonlyArray<CubeDimension>, readonly startingPoint: CubeCoordinates) { }


	static readonly F: CubePart = new CubePart(CubePartType.FACE, 0, 'F', [CubeFace.FRONT], [CubeFace.RIGHT],  [CubeDimension.X, CubeDimension.Y], CubeCoordinates.ZERO)
	static readonly R: CubePart = new CubePart(CubePartType.FACE, 1, 'R', [CubeFace.RIGHT], [CubeFace.FRONT], [CubeDimension.Y, CubeDimension.Z], CubeCoordinates.ZERO)
	static readonly U: CubePart = new CubePart(CubePartType.FACE, 2, 'U', [CubeFace.UP], [CubeFace.FRONT], [CubeDimension.X, CubeDimension.Z], CubeCoordinates.ZERO)
	static readonly B: CubePart = new CubePart(CubePartType.FACE, 3, 'B', [CubeFace.BACK], [CubeFace.RIGHT], [CubeDimension.X, CubeDimension.Y], CubeCoordinates.E_Z)
	static readonly L: CubePart = new CubePart(CubePartType.FACE, 4, 'L', [CubeFace.LEFT], [CubeFace.FRONT], [CubeDimension.Y, CubeDimension.Z], CubeCoordinates.E_X)
	static readonly D: CubePart = new CubePart(CubePartType.FACE, 5, 'D', [CubeFace.DOWN], [CubeFace.FRONT], [CubeDimension.X, CubeDimension.Z], CubeCoordinates.E_Y)

	static readonly ALL_FACES: ReadonlyArray<CubePart> = [CubePart.F, CubePart.R, CubePart.U, CubePart.B, CubePart.L, CubePart.D]

	static readonly UF: CubePart = new CubePart(CubePartType.EDGE, 0, 'UF', [CubeFace.UP, CubeFace.FRONT], [], [CubeDimension.X], CubeCoordinates.ZERO)
	static readonly UR: CubePart = new CubePart(CubePartType.EDGE, 1, 'UR', [CubeFace.UP, CubeFace.RIGHT], [], [CubeDimension.Z], CubeCoordinates.ZERO)
	static readonly BU: CubePart = new CubePart(CubePartType.EDGE, 2, 'BU', [CubeFace.BACK, CubeFace.UP], [], [CubeDimension.X], CubeCoordinates.E_Z)
	static readonly LU: CubePart = new CubePart(CubePartType.EDGE, 3, 'LU', [CubeFace.LEFT, CubeFace.UP], [],[CubeDimension.Z], CubeCoordinates.E_X)
	static readonly LF: CubePart = new CubePart(CubePartType.EDGE, 4, 'LF', [CubeFace.LEFT, CubeFace.FRONT], [],[CubeDimension.Y], CubeCoordinates.E_X)
	static readonly FR: CubePart = new CubePart(CubePartType.EDGE, 5, 'FR', [CubeFace.FRONT, CubeFace.RIGHT], [], [CubeDimension.Y], CubeCoordinates.ZERO)
	static readonly RB: CubePart = new CubePart(CubePartType.EDGE, 6, 'RB', [CubeFace.RIGHT, CubeFace.BACK], [], [CubeDimension.Y], CubeCoordinates.E_Z)
	static readonly BL: CubePart = new CubePart(CubePartType.EDGE, 7, 'BL', [CubeFace.BACK, CubeFace.LEFT], [], [CubeDimension.Y], CubeCoordinates.E_XZ)
	static readonly FD: CubePart = new CubePart(CubePartType.EDGE, 8, 'FD', [CubeFace.FRONT, CubeFace.DOWN], [], [CubeDimension.X], CubeCoordinates.E_Y)
	static readonly RD: CubePart = new CubePart(CubePartType.EDGE, 9, 'RD', [CubeFace.RIGHT, CubeFace.DOWN], [], [CubeDimension.Z], CubeCoordinates.E_Y)
	static readonly DB: CubePart = new CubePart(CubePartType.EDGE, 10, 'DB', [CubeFace.DOWN, CubeFace.BACK], [], [CubeDimension.X], CubeCoordinates.E_YZ)
	static readonly DL: CubePart = new CubePart(CubePartType.EDGE, 11, 'DL', [CubeFace.DOWN, CubeFace.LEFT], [], [CubeDimension.Z], CubeCoordinates.E_XY)

	static readonly ALL_EDGES: ReadonlyArray<CubePart> = [CubePart.UF, CubePart.UR, CubePart.BU, CubePart.LU, CubePart.LF, CubePart.FR, CubePart.RB, CubePart.BL, CubePart.FD, CubePart.RD, CubePart.DB, CubePart.DL]


	static readonly DRF: CubePart = new CubePart(CubePartType.CORNER, 0, 'DRF', [CubeFace.DOWN, CubeFace.RIGHT, CubeFace.FRONT], [], [], CubeCoordinates.E_Y)
	static readonly DBR: CubePart = new CubePart(CubePartType.CORNER, 1, 'DBR', [CubeFace.DOWN, CubeFace.BACK, CubeFace.RIGHT], [], [], CubeCoordinates.E_YZ)
	static readonly UFR: CubePart = new CubePart(CubePartType.CORNER, 2, 'UFR', [CubeFace.UP, CubeFace.FRONT, CubeFace.RIGHT], [], [], CubeCoordinates.ZERO)
	static readonly URB: CubePart = new CubePart(CubePartType.CORNER, 3, 'URB', [CubeFace.UP, CubeFace.RIGHT, CubeFace.BACK], [], [], CubeCoordinates.E_Z)
	static readonly ULF: CubePart = new CubePart(CubePartType.CORNER, 4, 'ULF', [CubeFace.UP, CubeFace.LEFT, CubeFace.FRONT], [], [], CubeCoordinates.E_X)
	static readonly UBL: CubePart = new CubePart(CubePartType.CORNER, 5, 'UBL', [CubeFace.UP, CubeFace.BACK, CubeFace.LEFT], [], [], CubeCoordinates.E_XZ)
	static readonly DLB: CubePart = new CubePart(CubePartType.CORNER, 6, 'DLB', [CubeFace.DOWN, CubeFace.LEFT, CubeFace.BACK], [], [], CubeCoordinates.E_XYZ)
	static readonly DFL: CubePart = new CubePart(CubePartType.CORNER, 7, 'DFL', [CubeFace.DOWN, CubeFace.FRONT, CubeFace.LEFT], [], [], CubeCoordinates.E_XY)

	static readonly ALL_CORNERS: ReadonlyArray<CubePart> = [CubePart.DRF, CubePart.DBR, CubePart.UFR, CubePart.URB, CubePart.ULF, CubePart.UBL, CubePart.DLB, CubePart.DFL]

	static readonly ALL:ReadonlyArray<ReadonlyArray<CubePart>>=[CubePart.ALL_CORNERS,CubePart.ALL_EDGES,CubePart.ALL_FACES];

	static fromCoordinates(remainingDimensions:ReadonlyArray<CubeDimension>, startingPoint: CubeCoordinates) {
		//console.log(remainingDimensions.length.toString()+":"+startingPoint.toString());
		let dimensionality=remainingDimensions.length;
		if (dimensionality>2) throw new Error ('Wrong Dimensionality (coordinates inside the cube?)');
		for (var cubePart of CubePart.ALL[dimensionality]) {
			if (deepEqual(cubePart.remainingDimensions,remainingDimensions) && deepEqual(cubePart.startingPoint,startingPoint)) return cubePart;
		}
		throw new Error ('CubePart not found');
	}


//TODO: Wofür brauchen wir hier [bei CubePart] indices???
//ANSWER: Weil wenn irgendwas später nummeriert werden soll, müssen CubeParts durchnummeriert werden (6,12,8), ebenso wie sie ein name:string haben müssen, wenn sie später serialisiert werden sollen.
// Mathematisch wären der Index von CubeParts eine Nummerierung aller (k aus n)*(2^k), wovon erstere auch nur recht künstlich funktioniert. 

	static fromIndexByType(index:number, type:CubePartType) {
		for (var cubePart of CubePart.ALL[type]) {
			if (cubePart.index==index) return cubePart;
		}
		throw new Error ('CubePart not found');
	}

	getNeighbouringAndAdditionalFaces():Array<CubeFace> {
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
	isContainedInFace(cubeFace:CubeFace):number {
		for (let i=0;i<this.neighbouringFaces.length;i++) {
			if (this.neighbouringFaces[i]==cubeFace) return i;
		}
		throw new Error('The cube part does not show this face (wrong normal vector for this location?)')
	}

	toString(): string {
		return this.name;
	}
}

