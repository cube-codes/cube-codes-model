import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { CubeSpecification } from "./CubeSpecification";

export class CubePartType implements Exportable, Equalizable<CubePartType>, Printable {

	private static readonly _all: Array<CubePartType> = new Array();

	static readonly CORNER: CubePartType = new CubePartType(0, 'CORNER');
	static readonly EDGE: CubePartType = new CubePartType(1, 'EDGE');
	static readonly FACE: CubePartType = new CubePartType(2, 'FACE');

	static getAll(): ReadonlyArray<CubePartType> {
		return this._all;
	}

	static getByIndex(index: number): CubePartType {
		const item = this._all[index];
		if (item === undefined) throw new Error(`Invalid index: ${index}`);
		return item;
	}

	private constructor(readonly index: number, readonly name: string) {
		CubePartType._all.push(this);
	}

	static import(value: string): CubePartType {
		return CubePartType.getByIndex(Number.parseInt(value));
	}

	export(): string {
		return this.index.toString();
	}

	equals(other: CubePartType): boolean {
		return this.index === other.index;
	}

	toString(): string {
		return `${this.name}`;
	}

	countDimensions() {
		return this.index;
	}

	countNormalVectors() {
		return 3 - this.index;
	}

	/**
	 * Numbering of the possible CubicalLocations of each type, depending on the cubes edgelength. To be used in CubeState and in random state generation and in strings
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