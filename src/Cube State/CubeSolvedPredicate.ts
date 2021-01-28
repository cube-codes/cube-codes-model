import { Printable } from "../Interfaces/Printable";
import { CubeState } from "./CubeState";

export abstract class AbstractCubeSolvedPredicate implements Printable {

	abstract isSolved(state: CubeState): boolean;

}

export class NeverCubeSolvedPredicate extends AbstractCubeSolvedPredicate {

	toString(): string {
		return 'Never';
	}

	isSolved(state: CubeState): boolean {
		return false;
	}

}