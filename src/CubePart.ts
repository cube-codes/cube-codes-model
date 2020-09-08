import { CubeCoordinates, CubeDimension } from "./CubeGeometry";
var deepEqual = require('deep-equal');

export enum CubePartType {
	CORNER = 0,
	EDGE = 1,
	FACE = 2
}

//TODO: Wofür brauchen wir hier indices???
export abstract class AbstractCubePart {

	protected constructor(readonly type: CubePartType, readonly index: number, readonly name: string, readonly neigbouringFaces: ReadonlyArray<CubeFace>, readonly coordinates: CubeCoordinates) { }

	toString(): string {
		return this.name;
	}

}

export class CubeFace extends AbstractCubePart {

	static readonly FRONT: CubeFace = new CubeFace(0, 'F', [], CubeDimension.X, CubeDimension.Y, CubeCoordinates.ZERO)
	static readonly RIGHT: CubeFace = new CubeFace(1, 'R', [], CubeDimension.Y, CubeDimension.Z, CubeCoordinates.ZERO)
	static readonly UP: CubeFace = new CubeFace(2, 'U', [], CubeDimension.X, CubeDimension.Z, CubeCoordinates.ZERO)
	static readonly BACK: CubeFace = new CubeFace(3, 'B', [], CubeDimension.X, CubeDimension.Y, CubeCoordinates.E_Z)
	static readonly LEFT: CubeFace = new CubeFace(4, 'L', [], CubeDimension.Y, CubeDimension.Z, CubeCoordinates.E_X)
	static readonly DOWN: CubeFace = new CubeFace(5, 'D', [], CubeDimension.X, CubeDimension.Z, CubeCoordinates.E_Y)

	static readonly ALL: ReadonlyArray<CubeFace> = [CubeFace.FRONT, CubeFace.RIGHT, CubeFace.UP, CubeFace.BACK, CubeFace.LEFT, CubeFace.DOWN]

	private constructor(index: number, name: string, neigbouringFaces: ReadonlyArray<CubeFace>, readonly dimension1: CubeDimension, readonly dimension2: CubeDimension, coordinates: CubeCoordinates) {
		super(CubePartType.FACE, index, name, neigbouringFaces, coordinates);
		(<{ neigbouringFaces: ReadonlyArray<CubeFace> }>this).neigbouringFaces = [this]; // Dirty trick to set the readonly property to '[this]'
	}

	static fromIndex(index: number): CubeFace {
		switch (index) {
			case 0: return CubeFace.FRONT;
			case 1: return CubeFace.RIGHT;
			case 2: return CubeFace.UP;
			case 3: return CubeFace.BACK;
			case 4: return CubeFace.LEFT;
			case 5: return CubeFace.DOWN;
			default: throw new Error(`Invalid index: ${index}`);
		}
	}

	static fromCoordinates(dimension1: CubeDimension, dimension2: CubeDimension, coordinates: CubeCoordinates): CubeFace {
		if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeFace.FRONT;
		} else if (dimension1 === CubeDimension.Y && dimension2 === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeFace.RIGHT;
		} else if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeFace.UP;
		} else if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.E_Z)) {
			return CubeFace.BACK;
		} else if (dimension1 === CubeDimension.Y && dimension2 === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.E_X)) {
			return CubeFace.LEFT;
		} else if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.E_Y)) {
			return CubeFace.DOWN;
		} else {
			throw new Error(`Invalid input: ${dimension1}, ${dimension2}, ${coordinates}`);
		}
	}

	getOrthogonalDimension(): CubeDimension {
		return this.dimension1.getOrthogonal(this.dimension2);
	}

	isBackside(): boolean {
		return !deepEqual(this.coordinates, CubeCoordinates.ZERO);
	}

	getNormalVector(): CubeCoordinates {
		if (this.isBackside()) {
			return CubeCoordinates.fromDimension(this.getOrthogonalDimension(), +1);
		} else {
			return CubeCoordinates.fromDimension(this.getOrthogonalDimension(), -1);
		}
	}

}

export class CubeCorner extends AbstractCubePart {

	static readonly DRF: CubeCorner = new CubeCorner(0, 'DRF', [CubeFace.DOWN, CubeFace.RIGHT, CubeFace.FRONT], CubeCoordinates.E_Y)
	static readonly DBR: CubeCorner = new CubeCorner(1, 'DBR', [CubeFace.DOWN, CubeFace.BACK, CubeFace.RIGHT], CubeCoordinates.E_YZ)
	static readonly UFR: CubeCorner = new CubeCorner(2, 'UFR', [CubeFace.UP, CubeFace.FRONT, CubeFace.RIGHT], CubeCoordinates.ZERO)
	static readonly URB: CubeCorner = new CubeCorner(3, 'URB', [CubeFace.UP, CubeFace.RIGHT, CubeFace.BACK], CubeCoordinates.E_Z)
	static readonly ULF: CubeCorner = new CubeCorner(4, 'ULF', [CubeFace.UP, CubeFace.LEFT, CubeFace.FRONT], CubeCoordinates.E_X)
	static readonly UBL: CubeCorner = new CubeCorner(5, 'UBL', [CubeFace.UP, CubeFace.BACK, CubeFace.LEFT], CubeCoordinates.E_XZ)
	static readonly DLB: CubeCorner = new CubeCorner(6, 'DLB', [CubeFace.DOWN, CubeFace.LEFT, CubeFace.BACK], CubeCoordinates.E_XYZ)
	static readonly DFL: CubeCorner = new CubeCorner(7, 'DFL', [CubeFace.DOWN, CubeFace.FRONT, CubeFace.LEFT], CubeCoordinates.E_XY)

	static readonly ALL: ReadonlyArray<CubeCorner> = [CubeCorner.DRF, CubeCorner.DBR, CubeCorner.UFR, CubeCorner.URB, CubeCorner.ULF, CubeCorner.UBL, CubeCorner.DLB, CubeCorner.DFL]

	private constructor(index: number, name: string, neigbouringFaces: ReadonlyArray<CubeFace>, coordinates: CubeCoordinates) {
		super(CubePartType.CORNER, index, name, neigbouringFaces, coordinates);
	}

	static fromIndex(index: number): CubeCorner {
		switch (index) {
			case 0: return CubeCorner.DRF;
			case 1: return CubeCorner.DBR;
			case 2: return CubeCorner.UFR;
			case 3: return CubeCorner.URB;
			case 4: return CubeCorner.ULF;
			case 5: return CubeCorner.UBL;
			case 6: return CubeCorner.DLB;
			case 7: return CubeCorner.DFL;
			default: throw new Error(`Invalid index: ${index}`);
		}
	}

	static fromCoordinates(coordinates: CubeCoordinates): CubeCorner {
		if (deepEqual(coordinates, CubeCoordinates.E_Y)) {
			return CubeCorner.DRF;
		} else if (deepEqual(coordinates, CubeCoordinates.E_YZ)) {
			return CubeCorner.DBR;
		} else if (deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeCorner.UFR;
		} else if (deepEqual(coordinates, CubeCoordinates.E_Z)) {
			return CubeCorner.URB;
		} else if (deepEqual(coordinates, CubeCoordinates.E_X)) {
			return CubeCorner.ULF;
		} else if (deepEqual(coordinates, CubeCoordinates.E_XZ)) {
			return CubeCorner.UBL;
		} else if (deepEqual(coordinates, CubeCoordinates.E_XYZ)) {
			return CubeCorner.DLB;
		} else if (deepEqual(coordinates, CubeCoordinates.E_XY)) {
			return CubeCorner.DFL;
		} else {
			throw new Error(`Invalid input: ${coordinates}`);
		}
	}

}

export class CubeEdge extends AbstractCubePart {

	static readonly UF: CubeEdge = new CubeEdge(0, 'UF', [CubeFace.UP, CubeFace.FRONT], CubeDimension.X, CubeCoordinates.ZERO)
	static readonly UR: CubeEdge = new CubeEdge(1, 'UR', [CubeFace.UP, CubeFace.RIGHT], CubeDimension.Z, CubeCoordinates.ZERO)
	static readonly BU: CubeEdge = new CubeEdge(2, 'BU', [CubeFace.BACK, CubeFace.UP], CubeDimension.X, CubeCoordinates.E_Z)
	static readonly LU: CubeEdge = new CubeEdge(3, 'LU', [CubeFace.LEFT, CubeFace.UP], CubeDimension.Z, CubeCoordinates.E_X)
	static readonly LF: CubeEdge = new CubeEdge(4, 'LF', [CubeFace.LEFT, CubeFace.FRONT], CubeDimension.Y, CubeCoordinates.E_X)
	static readonly FR: CubeEdge = new CubeEdge(5, 'FR', [CubeFace.FRONT, CubeFace.RIGHT], CubeDimension.Y, CubeCoordinates.ZERO)
	static readonly RB: CubeEdge = new CubeEdge(6, 'RB', [CubeFace.RIGHT, CubeFace.BACK], CubeDimension.Y, CubeCoordinates.E_Z)
	static readonly BL: CubeEdge = new CubeEdge(7, 'BL', [CubeFace.BACK, CubeFace.LEFT], CubeDimension.Y, CubeCoordinates.E_XZ)
	static readonly FD: CubeEdge = new CubeEdge(8, 'FD', [CubeFace.FRONT, CubeFace.DOWN], CubeDimension.X, CubeCoordinates.E_Y)
	static readonly RD: CubeEdge = new CubeEdge(9, 'RD', [CubeFace.RIGHT, CubeFace.DOWN], CubeDimension.Z, CubeCoordinates.E_Y)
	static readonly DB: CubeEdge = new CubeEdge(10, 'DB', [CubeFace.DOWN, CubeFace.BACK], CubeDimension.X, CubeCoordinates.E_YZ)
	static readonly DL: CubeEdge = new CubeEdge(11, 'DL', [CubeFace.DOWN, CubeFace.LEFT], CubeDimension.Z, CubeCoordinates.E_XY)

	static readonly ALL: ReadonlyArray<CubeEdge> = [CubeEdge.UF, CubeEdge.UR, CubeEdge.BU, CubeEdge.LU, CubeEdge.LF, CubeEdge.FR, CubeEdge.RB, CubeEdge.BL, CubeEdge.FD, CubeEdge.RD, CubeEdge.DB, CubeEdge.DL]

	private constructor(index: number, name: string, neigbouringFaces: ReadonlyArray<CubeFace>, readonly dimension: CubeDimension, coordinates: CubeCoordinates) {
		super(CubePartType.EDGE, index, name, neigbouringFaces, coordinates);
	}

	static fromIndex(index: number): CubeEdge {
		switch (index) {
			case 0: return CubeEdge.UF;
			case 1: return CubeEdge.UR;
			case 2: return CubeEdge.BU;
			case 3: return CubeEdge.LU;
			case 4: return CubeEdge.LF;
			case 5: return CubeEdge.FR;
			case 6: return CubeEdge.RB;
			case 7: return CubeEdge.BL;
			case 8: return CubeEdge.FD;
			case 9: return CubeEdge.RD;
			case 10: return CubeEdge.DB;
			case 11: return CubeEdge.DL;
			default: throw new Error(`Invalid index: ${index}`);
		}
	}

	static fromCoordinates(dimension: CubeDimension, coordinates: CubeCoordinates): CubeEdge {
		if (dimension === CubeDimension.X && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeEdge.UF
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeEdge.UR;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, CubeCoordinates.E_Z)) {
			return CubeEdge.BU;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.E_X)) {
			return CubeEdge.LU;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.E_X)) {
			return CubeEdge.LF;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.ZERO)) {
			return CubeEdge.FR;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.E_Z)) {
			return CubeEdge.RB;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, CubeCoordinates.E_XZ)) {
			return CubeEdge.BL;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, CubeCoordinates.E_Y)) {
			return CubeEdge.FD;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.E_Y)) {
			return CubeEdge.RD;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, CubeCoordinates.E_YZ)) {
			return CubeEdge.DB;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, CubeCoordinates.E_XY)) {
			return CubeEdge.DL;
		} else {
			throw new Error(`Invalid input: ${dimension}, ${coordinates}`);
		}
	}

}