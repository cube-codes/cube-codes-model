import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { PermutationCubeState } from "./PermutationCubeState";

export class SimonCubeMoveExporter {

	constructor(private readonly spec: CubeSpecification) { }

	parse(): PermutationCubeState {
		//TODO: Implement
		this.spec.edgeLength;
		return null as unknown as PermutationCubeState;
	}

	stringify(): string {
		//TODO: Implement
		return '';
	}

}