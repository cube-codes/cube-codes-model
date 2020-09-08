import { matrix, Matrix, identity, multiply, inv, number, getMatrixDataTypeDependencies, log, string, ResultSetDependencies } from 'mathjs'
import { EventData, Event } from "./Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";
import { CubeSpecification, CubeDimension } from './CubeGeometry';
import { CubeStateLanguage } from './CubeStateLanguage';
import { CubeMoveAngle, CubeMove } from './CubeMove';
import { CubeState } from './CubeState';
import { CornerCubical, EdgeCubical, FaceCubical, CornerCubicalLocation, EdgeCubicalLocation, FaceCubicalLocation, ReadonlyCornerCubical, ReadonlyEdgeCubical, ReadonlyFaceCubical } from './Cubical';
import { Random } from './Random';
import { CubeFace } from './CubePart';
var deepEqual = require('deep-equal')

/*
getLocationOfCubicle(v: Cubicle): Location
getCubicleAt(v: Location): Cubical
getOrientationAt<T>(v: Location<T>): Orientation<T>
getOrientationOn<T>(v: Cubicle<T>): Orientation<T>
isSolved: boolean
isLocationSolved(v: Cubicle): boolean
isCubicleSolved(v: Location): boolean
*/



/*
getAllEdges
getAllCorners
getAllFaces
getEdgesByFace
getCornersByFace
getEdgesByDimension
getCornersByDimension
getCubicalByCoordinates
*/

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

	readonly #cornerCubicals: ReadonlyArray<CornerCubical>

	readonly #edgeCubicals: ReadonlyArray<EdgeCubical>
	
	readonly #faceCubicals: ReadonlyArray<FaceCubical>

	constructor(
		readonly spec: CubeSpecification, state?: CubeState) {
		
		const cornerCubicals: Array<CornerCubical> = new Array<CornerCubical>();
		const edgeCubicals: Array<EdgeCubical> = new Array<EdgeCubical>();
		const faceCubicals: Array<FaceCubical> = new Array<FaceCubical>();
		for (let cornerCubicalIndex = 0; cornerCubicalIndex < CornerCubicalLocation.getIndexLength(spec); cornerCubicalIndex++) {
			cornerCubicals[cornerCubicalIndex] = CornerCubical.fromInitialLocation(new CornerCubicalLocation(spec, cornerCubicalIndex));
		}
		for (let edgeCubicalIndex = 0; edgeCubicalIndex < EdgeCubicalLocation.getIndexLength(spec); edgeCubicalIndex++) {
			edgeCubicals[edgeCubicalIndex] = EdgeCubical.fromInitialLocation(new EdgeCubicalLocation(spec, edgeCubicalIndex));
		}
		for (let faceCubicalIndex = 0; faceCubicalIndex < FaceCubicalLocation.getIndexLength(spec); faceCubicalIndex++) {
			faceCubicals[faceCubicalIndex] = FaceCubical.fromInitialLocation(new FaceCubicalLocation(spec, faceCubicalIndex));
		}
		this.#cornerCubicals = cornerCubicals;
		this.#edgeCubicals = edgeCubicals;
		this.#faceCubicals = faceCubicals;

		if(state) {
			this.setState(state);
		}
	}

	clone(): Cube {
		return new Cube(this.spec, this.getState());
	}

	get cornerCubicals(): ReadonlyArray<ReadonlyCornerCubical> {
		return this.#cornerCubicals;
	}

	get edgeCubicals(): ReadonlyArray<ReadonlyEdgeCubical> {
		return this.#edgeCubicals;
	}

	get faceCubicals(): ReadonlyArray<ReadonlyFaceCubical> {
		return this.#faceCubicals;
	}

	getStateLanguage(): CubeStateLanguage {
		return new CubeStateLanguage();
	}

	getMoveLanguage(): CubeMoveLanguage {
		return new CubeMoveLanguage(this.spec);
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

		for (let cornerCubicalIndex = 0; cornerCubicalIndex < CornerCubicalLocation.getIndexLength(this.spec); cornerCubicalIndex++) {
			if (sliceCoordinate === this.#cornerCubicals[cornerCubicalIndex].location.coordinates.getComponent(dimension)) {
				this.#cornerCubicals[cornerCubicalIndex].rotate(dimension);
			}
		}
		for (let edgeCubicalIndex = 0; edgeCubicalIndex < EdgeCubicalLocation.getIndexLength(this.spec); edgeCubicalIndex++) {
			if (sliceCoordinate === this.#edgeCubicals[edgeCubicalIndex].location.coordinates.getComponent(dimension)) {
				this.#edgeCubicals[edgeCubicalIndex].rotate(dimension);
			}
		}
		for (let faceCubicalIndex = 0; faceCubicalIndex < FaceCubicalLocation.getIndexLength(this.spec); faceCubicalIndex++) {
			if (sliceCoordinate === this.#faceCubicals[faceCubicalIndex].location.coordinates.getComponent(dimension)) {
				this.#faceCubicals[faceCubicalIndex].rotate(dimension);
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
		this.getMoveLanguage().parse(movesString).forEach(function (move) {
			this.move(move, source);
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