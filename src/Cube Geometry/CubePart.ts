import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Dimension } from "../Linear Algebra/Dimension";
import { Vector } from "../Linear Algebra/Vector";
import { CubeFace } from "./CubeFace";
import { CubePartType } from "./CubePartType";

/**
 * A cube part is some starting point plus remaining (running) coordinates. They come in types CORNER, EDGE, FACE and have an associated string and index as alternative description.
 * The normal vectors are counterclockwise ordered, with some arbitrary initial direction (used in computing ReorientationNumbers in CubeState). Face has 4 instead of 1 normal vector to account for the internal orientation of a FaceCubical (Picture on the cube)... 
 * In this class we define all 8 Corners, 12 Edges, 6 Faces explicitly.
 */
//TODO: nextCorners, Edges, Faces find them automatically
//TODO: Why here CubeFace?? What with Edge and Corner?
//TODO: Why must the Corners/Edges/Faces be ordered and why this additional Neighbours

/*

Cubelets sind Teil genau eines CubeParts

NVs:
Corner: 3 Normalvektoren raus aus dem Würfel
Edge  : 2 "
Face  : 1 " (Ist natürlich gleich dem NV des dazugehörenden CubeFace)
Kann man immer als CubeFaces angeben und der Part ist dann die Schnittmenge der Faces

NV Order:
Es gibt keine speziell sinnvolle Reihenfolge
Es muss nur eine festgelegt sein
Es soll ein Rechtsdrehendes System sein

Additional NV:
Nur type=Face brauchen sie um deren Std-Orientierung festzulegen
Es ist eine beliebige Wahl eines Faces das nicht dem eigenen und dem negativen eigenen entsprocht. (Punkt auf dem Face nach oben )

Lokales Koordinatensystem (immer 3 NV):
ist rechtsdrehend
Die ersten K davon sind die NV des Part, der Rest sind die noch freien Richtungsvektoren

Ortsvektor von Parts:
Ganz prinzipiell  gibe es einen Einheitswürfel mit x_i e {-1,0,1}
Lese die NV des lokalen Koordinatensystems. Diese geben 1/-1 Komponenten, der Rest ist 0. z.B. bei Kante UF -> X=0 wegen keinem NV, Y=1 wegen UP=positiv, Z=1 wegen FRONT=positiv

Reine Nachbarschaftsbeziehen lassen wir erstmal weg, wir kommen dann bei den Wünschen im Inspector drauf zurück....

Reihenfolge der Parts:
Lassen wir so, scheint aber beliebig und einfach mal festgelegt

*/
export class CubePartExport {

	constructor(readonly type: string,
	readonly index: number) {}

}

export class CubePart implements Exportable, Equalizable<CubePart>, Printable {

	private static readonly _allByType: Map<CubePartType, Array<CubePart>> = new Map();
	private static readonly _allByOriginAndDimensions: Map<string, CubePart> = new Map();

	static readonly DRF: CubePart = new CubePart(CubePartType.CORNER, 0, 'DRF', [CubeFace.DOWN, CubeFace.RIGHT, CubeFace.FRONT])
	static readonly DBR: CubePart = new CubePart(CubePartType.CORNER, 1, 'DBR', [CubeFace.DOWN, CubeFace.BACK, CubeFace.RIGHT])
	static readonly UFR: CubePart = new CubePart(CubePartType.CORNER, 2, 'UFR', [CubeFace.UP, CubeFace.FRONT, CubeFace.RIGHT])
	static readonly URB: CubePart = new CubePart(CubePartType.CORNER, 3, 'URB', [CubeFace.UP, CubeFace.RIGHT, CubeFace.BACK])
	static readonly ULF: CubePart = new CubePart(CubePartType.CORNER, 4, 'ULF', [CubeFace.UP, CubeFace.LEFT, CubeFace.FRONT])
	static readonly UBL: CubePart = new CubePart(CubePartType.CORNER, 5, 'UBL', [CubeFace.UP, CubeFace.BACK, CubeFace.LEFT])
	static readonly DLB: CubePart = new CubePart(CubePartType.CORNER, 6, 'DLB', [CubeFace.DOWN, CubeFace.LEFT, CubeFace.BACK])
	static readonly DFL: CubePart = new CubePart(CubePartType.CORNER, 7, 'DFL', [CubeFace.DOWN, CubeFace.FRONT, CubeFace.LEFT])

	static readonly UF: CubePart = new CubePart(CubePartType.EDGE, 0, 'UF', [CubeFace.UP, CubeFace.FRONT, CubeFace.RIGHT])
	static readonly UR: CubePart = new CubePart(CubePartType.EDGE, 1, 'UR', [CubeFace.UP, CubeFace.RIGHT, CubeFace.BACK])
	static readonly BU: CubePart = new CubePart(CubePartType.EDGE, 2, 'BU', [CubeFace.BACK, CubeFace.UP, CubeFace.RIGHT])
	static readonly LU: CubePart = new CubePart(CubePartType.EDGE, 3, 'LU', [CubeFace.LEFT, CubeFace.UP, CubeFace.BACK])
	static readonly LF: CubePart = new CubePart(CubePartType.EDGE, 4, 'LF', [CubeFace.LEFT, CubeFace.FRONT, CubeFace.UP])
	static readonly FR: CubePart = new CubePart(CubePartType.EDGE, 5, 'FR', [CubeFace.FRONT, CubeFace.RIGHT, CubeFace.UP])
	static readonly RB: CubePart = new CubePart(CubePartType.EDGE, 6, 'RB', [CubeFace.RIGHT, CubeFace.BACK, CubeFace.UP])
	static readonly BL: CubePart = new CubePart(CubePartType.EDGE, 7, 'BL', [CubeFace.BACK, CubeFace.LEFT, CubeFace.UP])
	static readonly FD: CubePart = new CubePart(CubePartType.EDGE, 8, 'FD', [CubeFace.FRONT, CubeFace.DOWN, CubeFace.RIGHT])
	static readonly RD: CubePart = new CubePart(CubePartType.EDGE, 9, 'RD', [CubeFace.RIGHT, CubeFace.DOWN, CubeFace.BACK])
	static readonly DB: CubePart = new CubePart(CubePartType.EDGE, 10, 'DB', [CubeFace.DOWN, CubeFace.BACK, CubeFace.RIGHT])
	static readonly DL: CubePart = new CubePart(CubePartType.EDGE, 11, 'DL', [CubeFace.DOWN, CubeFace.LEFT, CubeFace.BACK])

	// 2nd and 3rd normal vector must be ordered in respect to their dimension order
	static readonly F: CubePart = new CubePart(CubePartType.FACE, 0, 'F', [CubeFace.FRONT, CubeFace.RIGHT, CubeFace.UP])
	static readonly R: CubePart = new CubePart(CubePartType.FACE, 1, 'R', [CubeFace.RIGHT, CubeFace.UP, CubeFace.FRONT])
	static readonly U: CubePart = new CubePart(CubePartType.FACE, 2, 'U', [CubeFace.UP, CubeFace.LEFT, CubeFace.FRONT])
	static readonly B: CubePart = new CubePart(CubePartType.FACE, 3, 'B', [CubeFace.BACK, CubeFace.RIGHT, CubeFace.DOWN])
	static readonly L: CubePart = new CubePart(CubePartType.FACE, 4, 'L', [CubeFace.LEFT, CubeFace.UP, CubeFace.BACK])
	static readonly D: CubePart = new CubePart(CubePartType.FACE, 5, 'D', [CubeFace.DOWN, CubeFace.RIGHT, CubeFace.FRONT])

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

	static getByOriginAndDimensions(origin: Vector, dimensions: ReadonlyArray<Dimension>): CubePart {
		const item = this._allByOriginAndDimensions.get(JSON.stringify([origin, dimensions]));
		if(item === undefined) throw new Error(`Invalid origin and dimensions: ${origin}, ${dimensions}`);
		return item;
	}

	readonly normalVectors: ReadonlyArray<CubeFace>

	//SL: Changed directions to tangentVectors
	readonly tangentVectors: ReadonlyArray<CubeFace>

	readonly origin: Vector

	readonly dimensions: ReadonlyArray<Dimension>

	protected constructor(
		readonly type: CubePartType,
		readonly index: number,
		readonly name: string,
		readonly localBase: ReadonlyArray<CubeFace>) {
		
		if (localBase.length !== 3) throw new Error(`Invalid local base length: ${localBase.length}`);
		if (!localBase[0].getNormalVector().crossProduct(localBase[1].getNormalVector()).equals(localBase[2].getNormalVector())) throw new Error(`Invalid local base as they are not orthoganl or right-handed: ${localBase}`);
		
		this.normalVectors = localBase.slice(0, type.countNormalVectors());
		this.tangentVectors = localBase.slice(type.countNormalVectors(), 3);
		this.origin = this.normalVectors.reduce((origin, nv) => origin.withComponent(nv.dimension, nv.positiveDirection ? 1 : -1), Vector.ZERO);
		this.dimensions = this.tangentVectors.map(d => d.dimension);

		if(!CubePart._allByType.has(type)) CubePart._allByType.set(type, new Array());
		(CubePart._allByType.get(type) as Array<CubePart>).push(this);
		CubePart._allByOriginAndDimensions.set(JSON.stringify([this.origin, this.dimensions]), this);
	}

	static import(value: string): CubePart {
		const exportValue = JSON.parse(value) as CubePartExport;
		return CubePart.getByTypeAndIndex(CubePartType.import(exportValue.type), exportValue.index);
	}

	export(): string {
		return JSON.stringify(new CubePartExport(this.type.export(), this.index));
	}

	equals(other: CubePart): boolean {
		return this.type.equals(other.type) && this.index === other.index;
	}

	toString(): string {
		return this.name;
	}

}
