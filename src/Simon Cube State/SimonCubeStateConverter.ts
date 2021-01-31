import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Cubelet } from "../Cube/Cubelet";
import { ReadonlyCubelet } from "../Cube/ReadonlyCubelet";
import { SimonCubeState } from "./SimonCubeState";

export class SimonCubeStateConverter {

	constructor(private readonly spec: CubeSpecification) { }

	save(cubelets: ReadonlyArray<ReadonlyCubelet>): SimonCubeState {
		//TODO: Implement
		this.spec.edgeLength
		return null as unknown as SimonCubeState;
	}

	load(state: SimonCubeState, cubelets: ReadonlyArray<Cubelet>): void {
		//TODO: Implement
	}

	// Der Rest sollte private methoden sein

}