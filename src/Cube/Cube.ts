import { CubeMoveExporter } from "../Cube Move/CubeMoveExporter";
import { CubeState } from '../Cube State/CubeState';
import { Cubelet } from './Cubelet';
import { Random } from '../Utilities/Random';
import { CubeletInspector } from "./CubeletInspector";
import { CubeMove } from "../Cube Move/CubeMove";
import { Printable } from "../Interface/Printable";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Event } from "../Event/Event";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubePart } from "../Cube Geometry/CubePart";
import { Dimension } from "../Linear Algebra/Dimension";
import { CubeMoveAngle } from "../Cube Move/CubeMoveAngle";
import { CubeFace } from "../Cube Geometry/CubeFace";
import { CubeStateChanged } from "./CubeStateChanged";
import { CubeletLocation } from "./CubeletLocation";
import { CubeSolutionCondition } from "./CubeSolutionCondition";
import { CubeletState } from "../Cube State/CubeletState";
import { CubeletOrientation } from "./CubeletOrientation";

export class Cube implements Printable {

	/**
	 * @event
	 */
	readonly stateChanged = new Event<CubeStateChanged>();

	readonly #cubelets: ReadonlyArray<Cubelet>

	constructor(
		readonly spec: CubeSpecification, readonly solv:CubeSolutionCondition, state?: CubeState) {

		const cubelets = new Array<Cubelet>();
		for (const cubePartType of CubePartType.getAll()) {
			for (const cubePart of CubePart.getByType(cubePartType)) {
				for (const cubeletLocation of CubeletLocation.fromPart(spec, cubePart)) {
					cubelets.push(new Cubelet(this, cubeletLocation));
				}
			}
		}
		this.#cubelets = cubelets;

		if (state) {
			this.setState(state);
		}

	}

	toString(): string {
		//TODO: ???
		return '';
	}

	get cubelets(): CubeletInspector {
		return new CubeletInspector(this.#cubelets);
	}

	getCubeMoveExporter(): CubeMoveExporter {
		return new CubeMoveExporter(this.spec);
	}

	isSolved(): boolean {
		return this.solv.isCubeSolved(this);
	}

	getState(): CubeState {
		const cubelets = new Array<CubeletState>();
		for (let cubelet of this.#cubelets) {
			cubelets.push(new CubeletState(cubelet.initialLocation.origin, cubelet.location.origin, cubelet.orientation.matrix));
		}
		return new CubeState(this.spec,this.solv, cubelets);
	}

	setState(newState: CubeState, source?: object): Cube {

		if (!this.spec.equals(newState.spec)) throw new Error(`Invalid spec of new state: ${newState.spec}`);

		//TODO: More validation? Depends on validation in cubeState

		const oldState = this.getState();

		for (let cubeletState of newState.cubelets) {
			for (let cubelet of this.#cubelets) {
				if (cubelet.initialLocation.origin.equals(cubeletState.initialLocation)) {
					cubelet.beam(new CubeletLocation(this.spec, cubeletState.location), new CubeletOrientation(cubeletState.orientation));
				}
			}
		}

		this.stateChanged.trigger({ oldState: oldState, newState: newState, source: source });

		return this;

	}

	move(move: CubeMove, source?: object): Cube {

		if (!this.spec.equals(move.spec)) throw new Error(`Invalid spec of move: ${move.spec}`);

		const oldState = this.getState();

		const dimension = move.face.dimension;
		const componentMaximum = (this.spec.edgeLength - 1) / 2;
		const startSliceComponent = (componentMaximum - (move.sliceStart - 1)) * (move.face.positiveDirection ? 1 : -1); // sliceStart is one-based
		const angle = (((move.angle * (move.face.positiveDirection ? 1 : -1) * -1) % 4) + 4) % 4; // rotateSlice rotates CCW

		for (let sliceComponent = startSliceComponent; sliceComponent < startSliceComponent + move.sliceCount; sliceComponent++) {
			for (let angleIndex = 0; angleIndex < angle; angleIndex++) {
				for (let cubelet of this.#cubelets) {
					if (cubelet.location.origin.componentEquals(dimension, sliceComponent)) {
						cubelet.rotate(dimension);
					}
				}
			}
		}

		this.stateChanged.trigger({ oldState: oldState, newState: this.getState(), move: move, source: source });

		return this;

	}

	// Generic Rotations

	mRangeSlices(face: CubeFace, sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.move(new CubeMove(this.spec, face, sliceStart, sliceCount, angle), source);
	}

	mBlockSlices(face: CubeFace, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mRangeSlices(face, 1, sliceCount, angle, source);
	}

	mFaceSlice(face: CubeFace, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mBlockSlices(face, 1, angle, source);
	}

	mCenterSlice(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), Math.floor((this.spec.edgeLength + 1) / 2), 1, angle, source);
	}

	mInlaySlices(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), this.spec.edgeLength - 1, this.spec.edgeLength - 2, angle, source);
	}

	mCube(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Cube {
		return this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), 1, this.spec.edgeLength, angle, source);
	}

	// Specific Range Rotations

	mRightRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.RIGHT, sliceStart, sliceCount, angle, source);
	}

	mUpRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.UP, sliceStart, sliceCount, angle, source);
	}

	mFrontRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.FRONT, sliceStart, sliceCount, angle, source);
	}

	mLeftRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.LEFT, sliceStart, sliceCount, angle, source);
	}

	mDownRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.DOWN, sliceStart, sliceCount, angle, source);
	}

	mBackRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mRangeSlices(CubeFace.BACK, sliceStart, sliceCount, angle, source);
	}

	// Specific Block Rotations

	mRightBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.RIGHT, sliceCount, angle, source);
	}

	mUpBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.UP, sliceCount, angle, source);
	}

	mFrontBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.FRONT, sliceCount, angle, source);
	}

	mLeftBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.LEFT, sliceCount, angle, source);
	}

	mDownBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.DOWN, sliceCount, angle, source);
	}

	mBackBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mBlockSlices(CubeFace.BACK, sliceCount, angle, source);
	}

	// Specific Face Rotations

	mRight(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.RIGHT, angle, source);
	}

	mUp(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.UP, angle, source);
	}

	mFront(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.FRONT, angle, source);
	}

	mLeft(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.LEFT, angle, source);
	}

	mDown(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.DOWN, angle, source);
	}

	mBack(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mFaceSlice(CubeFace.BACK, angle, source);
	}

	// Specific Center Rotations

	mMiddle(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCenterSlice(Dimension.X, angle, source);
	}

	mEquator(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCenterSlice(Dimension.Y, angle, source);
	}

	mStand(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCenterSlice(Dimension.Z, angle, source);
	}

	// Specific Center Rotations

	mMiddleInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mInlaySlices(Dimension.X, angle, source);
	}

	mEquatorInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mInlaySlices(Dimension.Y, angle, source);
	}

	mStandInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mInlaySlices(Dimension.Z, angle, source);
	}

	// Specific Cube Rotations

	mX(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCube(Dimension.X, angle, source);
	}

	mY(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCube(Dimension.Y, angle, source);
	}

	mZ(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object) {
		return this.mCube(Dimension.Z, angle, source);
	}

	// Others

	mString(movesString: string, source?: object): Cube {
		this.getCubeMoveExporter().parse(movesString).forEach(move => this.move(move, source));
		return this;
	}

	shuffleByMove(movesLength: number = 100, source?: object): Cube {

		for (let moveIndex = 0; moveIndex < movesLength; moveIndex++) {
			const face = CubeFace.getByIndex(Random.randomIntegerToInclusivly(5));
			const sliceStart = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength);
			const sliceCount = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength - sliceStart + 1);
			const angle = Random.randomIntegerFromToInclusivly(1, 3);
			this.mRangeSlices(face, sliceStart, sliceCount, angle, source);
		}

		return this;

	}

}