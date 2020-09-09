import { EventData, Event } from "../Utilities/Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";
import { CubeSpecification, CubeDimension } from './CubeGeometry';
import { CubeStateLanguage } from './CubeStateLanguage';
import { CubeMoveAngle, CubeMove } from './CubeMove';
import { CubeState } from './CubeState';
import { Cubical, CubicalSolvedCondition, AbstractCubicalLocation } from './Cubical';
import { Random } from '../Utilities/Random';
import { CubeFace, CubePartTypes } from './CubePart';
import { CubicalInspector } from "./CubicalInspector";
import deepEqual from "deep-equal";

export interface CubeStateChanged extends EventData {
	readonly oldState: CubeState
	readonly newState: CubeState
	readonly move?: CubeMove
}

export class Cube {

	static defaultSolvedCondition(spec: CubeSpecification): CubicalSolvedCondition {
		return cubical => {
			//TODO: Implement
			return false;
		};
	}

	/**
	 * @event
	 */
	readonly stateChanged = new Event<CubeStateChanged>();

	readonly solvedCondition: CubicalSolvedCondition

	readonly #cubicals: ReadonlyArray<Cubical<any>>

	constructor(
		readonly spec: CubeSpecification, customSolvedCondition?: CubicalSolvedCondition, state?: CubeState) {

		this.solvedCondition = customSolvedCondition ?? Cube.defaultSolvedCondition(this.spec);
		
		const cubicals = new Array<Cubical<any>>();
		for(const type of CubePartTypes.ALL) {
			for (let cubicalIndex = 0; cubicalIndex < AbstractCubicalLocation.countByType(spec, type); cubicalIndex++) {
				cubicals.push(Cubical.fromInitialIndex(this, type, cubicalIndex));
			}
		}
		this.#cubicals = cubicals;

		if(state) {
			this.setState(state);
		}
	}

	clone(): Cube {
		return new Cube(this.spec, this.solvedCondition, this.getState());
	}

	get cubicals(): CubicalInspector<any> {
		return new CubicalInspector(this.#cubicals);
	}

	getStateLanguage(): CubeStateLanguage {
		return new CubeStateLanguage();
	}

	getMoveLanguage(): CubeMoveLanguage {
		return new CubeMoveLanguage(this.spec);
	}

	isSolved(customCondition?: CubicalSolvedCondition): boolean {
		return this.cubicals.areSolved(customCondition);
	}

	getState(): CubeState {
		//TODO: Implement
		throw new Error('Implement');
	}

	setState(newState: CubeState, source?: object): Cube {

		if (!deepEqual(this.spec, newState.spec)) throw new Error(`Invalid spec of new state: ${newState.spec}`);
		
		const oldState = this.getState();
		
		//TODO: Implement
		throw new Error('Implement');
		
		this.stateChanged.trigger({ oldState: oldState, newState: newState, source: source });
		
		return this;
	
	}

	private rotateSlice(dimension: CubeDimension, sliceCoordinate: number): void {

		for (let cubical of this.#cubicals) {
			if (sliceCoordinate === cubical.location.coordinates.getComponent(dimension)) {
				cubical.rotate(dimension);
			}
		}

	}

	move(move: CubeMove, source?: object): Cube {

		if (!deepEqual(this.spec, move.spec)) throw new Error(`Invalid spec of move: ${move.spec}`);

		if (move.angle % 4 === 0) return this;
		
		const oldState = this.getState();
		
		const dimension = move.face.getOrthogonalDimension();
		const firstSliceCoordinate = move.face.isBackside() ? 0 : this.spec.edgeLength - move.slices;
		const lastSliceCoordinate = move.face.isBackside() ? move.slices - 1 : this.spec.edgeLength - 1;
		const angle = (((move.face.isBackside() ? move.angle : -move.angle) % 4) + 4) % 4;

		for (let sliceCoordinate = firstSliceCoordinate; sliceCoordinate <= lastSliceCoordinate; sliceCoordinate++) {
			for (let angleIndex = 0; angleIndex < angle; angleIndex++) {
				this.rotateSlice(dimension, sliceCoordinate);
			}
		}
		
		this.stateChanged.trigger({ oldState: oldState, newState: this.getState(), move: move, source: source });
		
		return this;
	
	}

	mw(face: CubeFace, slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.move(new CubeMove(this.spec, face, slices, angle), source);
	}

	mwFront(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.FRONT, slices, angle, source);
	}

	mwRight(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.RIGHT, slices, angle, source);
	}

	mwUp(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.UP, slices, angle, source);
	}

	mwBack(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.BACK, slices, angle, source);
	}

	mwLeft(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.LEFT, slices, angle, source);
	}

	mwDown(slices: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(CubeFace.DOWN, slices, angle, source);
	}

	m(face: CubeFace, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(face, 1, angle, source);
	}

	mFront(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.FRONT, angle, source);
	}

	mRight(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.RIGHT, angle, source);
	}

	mUp(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.UP, angle, source);
	}

	mBack(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.BACK, angle, source);
	}

	mLeft(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.LEFT, angle, source);
	}

	mDown(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.m(CubeFace.DOWN, angle, source);
	}

	r(face: CubeFace, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mw(face, this.spec.edgeLength, angle, source);
	}

	rZ(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.r(CubeFace.FRONT, angle, source);
	}

	rX(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.r(CubeFace.RIGHT, angle, source);
	}

	rY(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.r(CubeFace.UP, angle, source);
	}

	ml(movesString: string, source?: object): Cube {
		const me = this;
		this.getMoveLanguage().parse(movesString).forEach(function (move) {
			me.move(move, source);
		});
		return this;
	}

	shuffleByExplosion(source?: object): Cube {
		//TODO: Implement
		throw new Error('Not yet implemented (orientation somewhat tricky)');
	}
	
	shuffleByMove(moveLength: number = 100, source?: object): Cube {
		for (let moveIndex = 0; moveIndex < moveLength; moveIndex++) {
			const face = CubeFace.fromIndex(Random.randomIntegerToInclusivly(5));
			const slices = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength - 1);
			const angle = Random.randomIntegerFromToInclusivly(1, 3);
			this.mw(face, slices, angle, source);
		}
		return this;
	}
	
	shuffle(moveLength: number = 100, source?: object): Cube {
		return this.shuffleByMove(moveLength, source);
	}

}