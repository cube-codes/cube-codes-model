import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubeletLocation } from "../Cube/CubeletLocation";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { Arrays } from "../Utilities/Arrays";
import { CubeletState, CubeletStateExport } from "./CubeletState";

export class CubeStateExport {

	constructor(readonly cubelets: ReadonlyArray<CubeletStateExport>) { }

}

export class CubeState implements Exportable<CubeStateExport>, Equalizable<CubeState>, Printable {

	constructor(spec: CubeSpecification,
		readonly cubelets: ReadonlyArray<CubeletState>) {
		//TODO: lots of validation
	}

	static fromSolved(spec: CubeSpecification): CubeState {
		const cubelets = Array<CubeletState>();
		for (const cubePartType of CubePartType.getAll()) {
			for (const cubePart of CubePart.getByType(cubePartType)) {
				for (const cubeletLocation of CubeletLocation.fromPart(spec, cubePart)) {
					cubelets.push(new CubeletState(cubeletLocation.origin, cubeletLocation.origin, Matrix.IDENTITY));
				}
			}
		}
		return new CubeState(spec, cubelets);
	}

	static import(spec: CubeSpecification, value: CubeStateExport): CubeState {
		return new CubeState(spec, value.cubelets.map(c => CubeletState.import(c)));
	}

	export(): CubeStateExport {
		return new CubeStateExport(this.cubelets.map(c => c.export()));
	}

	equals(other: CubeState): boolean {
		return Arrays.equals(this.cubelets, other.cubelets);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}