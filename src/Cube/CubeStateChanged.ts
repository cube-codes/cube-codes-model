import { CubeMove } from "../Cube Move/CubeMove";
import { CubeState } from "../Cube State/CubeState";
import { EventData } from "../Event/EventData";

export interface CubeStateChanged extends EventData {
	readonly oldState: CubeState
	readonly newState: CubeState
	readonly move?: CubeMove
}