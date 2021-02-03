import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubeletLocation } from "../Cube/CubeletLocation";
import { CubeSolutionCondition } from "../Cube/CubeSolutionCondition";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "../Linear Algebra/Matrix";
import { Arrays } from "../Utilities/Arrays";
import { CubeletState } from "./CubeletState";

export class CubeStateExport {

	constructor(readonly spec: string,
		readonly solutionCondition: string,
		readonly cubelets: ReadonlyArray<string>) { }

}

export class CubeState implements Exportable, Equalizable<CubeState>, Printable {

	constructor(readonly spec: CubeSpecification,
		readonly solutionCondition: CubeSolutionCondition,
		readonly cubelets: ReadonlyArray<CubeletState>) {
		//TODO: lots of validation
	}

	static fromSolved(spec: CubeSpecification, solutionCondition: CubeSolutionCondition): CubeState {
		const cubelets = Array<CubeletState>();
		for (const cubePartType of CubePartType.getAll()) {
			for (const cubePart of CubePart.getByType(cubePartType)) {
				for (const cubeletLocation of CubeletLocation.fromPart(spec, cubePart)) {
					cubelets.push(new CubeletState(cubeletLocation.origin, cubeletLocation.origin, Matrix.IDENTITY));
				}
			}
		}
		return new CubeState(spec, solutionCondition, cubelets);
	}

	static import(value: string): CubeState {
		const exportValue = JSON.parse(value) as CubeStateExport;
		return new CubeState(CubeSpecification.import(exportValue.spec), CubeSolutionCondition.import(exportValue.solutionCondition), exportValue.cubelets.map(c => CubeletState.import(c)));
	}

	export(): string {
		return JSON.stringify(new CubeStateExport(this.spec.export(), this.solutionCondition.export(), this.cubelets.map(c => c.export())));
	}

	equals(other: CubeState): boolean {
		return this.spec.equals(other.spec) && this.solutionCondition.equals(other.solutionCondition) && Arrays.equals(this.cubelets, other.cubelets);
	}

	toString(): string {
		//TODO: ???
		return '';
	}

}