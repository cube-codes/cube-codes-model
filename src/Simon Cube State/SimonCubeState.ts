import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Arrays } from "../Utilities/Arrays";
import { CubeletState } from "../Cube State/CubeletState";

export class SimonCubeStateExport {

	// Hier alles rein was den Zustand ausmacht und schon exportiert ist (type ist etwas stringähnliches oder anderes primitives) (relevant zum Exportieren)
	constructor(readonly spec: string,
		readonly cubelets: ReadonlyArray<string>) { }

}

// CubeletState nicht benutzen. Ist hier nur ein Beispiel aus Cubestate übernommen
export class SimonCubeState implements Exportable, Equalizable<SimonCubeState>, Printable {

	// Eigenschaften festlegen, die man braucht
	constructor(readonly spec: CubeSpecification,
		readonly cubelets: ReadonlyArray<CubeletState>) {
		//TODO: lots of validation
	}

	static import(value: string): SimonCubeState {
		const exportValue = JSON.parse(value) as SimonCubeStateExport;
		return new SimonCubeState(CubeSpecification.import(exportValue.spec), exportValue.cubelets.map(c => CubeletState.import(c)));
	}

	export(): string {
		return JSON.stringify(new SimonCubeStateExport(this.spec.export(), this.cubelets.map(c => c.export())));
	}

	equals(other: SimonCubeState): boolean {
		return this.spec.equals(other.spec) && Arrays.equals(this.cubelets, other.cubelets);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}