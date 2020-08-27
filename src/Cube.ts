import { EventData, Event } from "./Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";

export class CubeState {
	constructor(
		readonly length: number) {
		if (!Number.isInteger(length) || length < 2 || length > 8) throw 'Invalid length';
	}
	move(move: CubeMove) {
		throw new Error("TODO");
		return new CubeState(1);
	}
}

export enum CubeFace {
	FRONT = 0,
	RIGHT = 1,
	UP = 2,
	BACK = 3,
	LEFT = 4,
	DOWN = 5
}

export enum CubeAngle {
	C90 = 1,
	C180 = 2,
	CC90 = -1,
	CC108 = -2
}

export class CubeMove {
	constructor(
		readonly face: number | CubeFace,
		readonly slices: number,
		readonly angle: number | CubeAngle) {
		if (!Number.isInteger(face) || face < 0 || face > 5) throw 'Invalid face';
		if (!Number.isInteger(slices) || slices < 1) throw 'Invalid slices';
		if (!Number.isInteger(angle) || Math.abs(angle) < 1 || Math.abs(angle) > 2) throw 'Invalid angel';
	}
	getInverse(): CubeMove {
		return new CubeMove(this.face, this.slices, -this.angle);
	}
}

export interface CubeStateChanged extends EventData {
	readonly oldState: CubeState
	readonly newState: CubeState
	readonly move?: CubeMove
}

export class Cube {

	/**
	 * @event
	 */
	readonly stateChanged = new Event<CubeStateChanged>();

	private state: CubeState

	constructor(state: CubeState) {
		this.state = state;
	}

	getState() {
		return this.state;
	}

	setState(newState: CubeState, source?: object) {
		let oldState = this.state;
		this.state = newState;
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, source: source });
		return this;
	}

	move(move: CubeMove, source?: object) {
		let oldState = this.state;
		this.state = this.state.move(move);
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, move: move, source: source });
		return this;
	}

	mw(face: number | CubeFace, slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.move(new CubeMove(face, slices, angle), source);
	}

	mwFront(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.FRONT, slices, angle, source);
	}

	mwRight(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.RIGHT, slices, angle, source);
	}

	mwUp(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.UP, slices, angle, source);
	}

	mwBack(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.BACK, slices, angle, source);
	}

	mwLeft(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.LEFT, slices, angle, source);
	}

	mwDown(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.DOWN, slices, angle, source);
	}

	m(face: number | CubeFace, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(face, 1, angle, source);
	}

	mFront(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.FRONT, angle, source);
	}

	mRight(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.RIGHT, angle, source);
	}

	mUp(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.UP, angle, source);
	}

	mBack(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.BACK, angle, source);
	}

	mLeft(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.LEFT, angle, source);
	}

	mDown(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.DOWN, angle, source);
	}

	r(face: number | CubeFace, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(face, this.state.length, angle, source);
	}

	rZ(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.FRONT, angle, source);
	}

	rX(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.RIGHT, angle, source);
	}

	rY(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.UP, angle, source);
	}

	ml(movesString: string, source?: object) {
		CubeMoveLanguage.parse(movesString, this.state.length).forEach(function (move) {
			this.move(move, source);
		});
		return this;
	}

}