import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Identifiable } from "../Interface/Identifiable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { Vector } from "../Linear Algebra/Vector";

export class CubeletStateExport {

	constructor(readonly initialLocation: ReadonlyArray<number>,
		readonly location: ReadonlyArray<number>,
		readonly orientation: ReadonlyArray<ReadonlyArray<number>>) { }

}

export class CubeletState implements Exportable<CubeletStateExport>, Identifiable, Equalizable<CubeletState>, Printable {

	constructor(readonly initialLocation: Vector,
		readonly location: Vector,
		readonly orientation: Matrix) {
		//TODO: Lots of validation
	}

	static import(value: CubeletStateExport): CubeletState {
		return new CubeletState(Vector.import(value.initialLocation), Vector.import(value.location), Matrix.import(value.orientation));
	}

	export(): CubeletStateExport {
		return new CubeletStateExport(this.initialLocation.export(), this.location.export(), this.orientation.export());
	}

	id(): string {
		return JSON.stringify(this.export());
	}

	equals(other: CubeletState): boolean {
		return this.initialLocation.equals(other.initialLocation) && this.location.equals(other.location) && this.orientation.equals(other.orientation);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}