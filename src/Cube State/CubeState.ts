import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubeletLocation } from "../Cube/CubeletLocation";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { Arrays } from "../Utilities/Arrays";
import { CubeletState } from "./CubeletState";

export class CubeStateExport {

	constructor(readonly spec: string,
		readonly cubelets: ReadonlyArray<string>) { }

}

export class CubeState implements Exportable, Equalizable<CubeState>, Printable {

	constructor(readonly spec: CubeSpecification,
		readonly cubelets: ReadonlyArray<CubeletState>) {
		//TODO: lots of validation
	}

	static fromSolved(spec: CubeSpecification) {
		const cubelets = Array<CubeletState>();
		for (const cubePartType of CubePartType.getAll()) {
			for (const cubePart of CubePart.getByType(cubePartType)) {
				for (const cubeletLocation of CubeletLocation.fromPart(spec, cubePart)) {
					cubelets.push(new CubeletState(cubeletLocation.origin, cubeletLocation.origin, Matrix.IDENTITY));
				}
			}
		}
	}

	static import(value: string): CubeState {
		const exportValue = JSON.parse(value) as CubeStateExport;
		return new CubeState(CubeSpecification.import(exportValue.spec), exportValue.cubelets.map(c => CubeletState.import(c)));
	}

	export(): string {
		return JSON.stringify(new CubeStateExport(this.spec.export(), this.cubelets.map(c => c.export())));
	}

	equals(other: CubeState): boolean {
		return this.spec.equals(other.spec) && Arrays.equals(this.cubelets, other.cubelets);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}