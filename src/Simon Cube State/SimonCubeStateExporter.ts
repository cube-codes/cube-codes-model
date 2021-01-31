import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { SimonCubeState } from "./SimonCubeState";

export class SimonCubeMoveExporter {

	constructor(private readonly spec: CubeSpecification) { }

	parse(): SimonCubeState {
		//TODO: Implement
		this.spec.edgeLength;
		return null as unknown as SimonCubeState;
	}

	stringify(): string {
		//TODO: Implement
		return '';
	}

}