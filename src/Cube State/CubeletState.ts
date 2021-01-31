import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { Vector } from "../Linear Algebra/Vector";

export class CubeletStateExport {

	constructor(readonly initialLocation: string,
		readonly location: string,
		readonly orientation: string) { }

}

export class CubeletState implements Exportable, Equalizable<CubeletState>, Printable {

	constructor(readonly initialLocation: Vector,
		readonly location: Vector,
		readonly orientation: Matrix) {
		//TODO: Lots of validation
	}

	static import(value: string): CubeletState {
		const exportValue = JSON.parse(value) as CubeletStateExport;
		return new CubeletState(Vector.import(exportValue.initialLocation), Vector.import(exportValue.location), Matrix.import(exportValue.orientation));
	}

	export(): string {
		return JSON.stringify(new CubeletStateExport(this.initialLocation.export(), this.location.export(), this.orientation.export()));
	}

	equals(other: CubeletState): boolean {
		return this.initialLocation.equals(other.initialLocation) && this.location.equals(other.location) && this.orientation.equals(other.orientation);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}