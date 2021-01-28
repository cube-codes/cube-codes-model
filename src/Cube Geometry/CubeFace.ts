import { Vector } from "../Linear Algebra/Vector";
import { Equalizable } from "../Interfaces/Equalizable";
import { Exportable } from "../Interfaces/Exportable";
import { Printable } from "../Interfaces/Printable";
import { Dimension } from "../Linear Algebra/Dimension";

/** 
 * CubeFaces are directions in which normal vectors point, in which cubicals show different stickers. Of course CubeFaces can be identified with CubeParts of type Face, but they have different roles.
 */
export class CubeFace implements Exportable, Equalizable<CubeFace>, Printable {

	private static readonly _all: Array<CubeFace> = new Array();
	private static readonly _allByNormalVectorExport: Map<string, CubeFace> = new Map();

	static readonly RIGHT: CubeFace = new CubeFace(0, 'RIGHT', Dimension.X, true);
	static readonly UP: CubeFace = new CubeFace(1, 'UP', Dimension.Y, true);
	static readonly FRONT: CubeFace = new CubeFace(2, 'FRONT', Dimension.Z, true);
	static readonly LEFT: CubeFace = new CubeFace(3, 'LEFT', Dimension.X, false);
	static readonly DOWN: CubeFace = new CubeFace(4, 'DOWN', Dimension.Y, false);
	static readonly BACK: CubeFace = new CubeFace(5, 'BACK', Dimension.Z, false);

	static getAll(): ReadonlyArray<CubeFace> {
		return this._all;
	}

	static getByIndex(index: number): CubeFace {
		const item = this._all[index];
		if (item === undefined) throw new Error(`Invalid index: ${index}`);
		return item;
	}

	static getByNormalVector(normalVector: Vector): CubeFace {
		const item = this._allByNormalVectorExport.get(normalVector.export());
		if (item === undefined) throw new Error(`Invalid normal vector: ${normalVector}`);
		return item;
	}

	private constructor(readonly index: number, readonly name: string, readonly dimension: Dimension, readonly positiveDirection: boolean) {
		CubeFace._all.push(this);
		CubeFace._allByNormalVectorExport.set(this.getNormalVector().export(), this);
	}

	static import(value: string): CubeFace {
		return CubeFace.getByIndex(Number.parseInt(value));
	}

	export(): string {
		return this.index.toString();
	}

	equals(other: CubeFace): boolean {
		return this.index === other.index;
	}

	toString(): string {
		return `${this.name}`;
	}

	/**
	 * The normal vector pointing outwards this face
	 */
	//TODO: Refactor: Das war so geschrieben
	/*getNormalVector(): CubeCoordinates {
		if (!this.backside) {
			return CubeCoordinates.fromDimension(this.dimension, -1);
		} else {
			return CubeCoordinates.fromDimension(this.dimension, +1);
		}
	}*/
	getNormalVector(): Vector {
		return Vector.fromComponent(this.dimension, this.positiveDirection ? 1 : -1);
	}

}