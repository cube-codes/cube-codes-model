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

	readonly solutionCondition = new CubeSolutionCondition();

	readonly #cubelets: ReadonlyArray<Cubelet>

	constructor(
		readonly spec: CubeSpecification, state?: CubeState) {

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
		return this.solutionCondition.isCubeSolved(this);
	}

	getState(): CubeState {
		const cubelets = new Array<CubeletState>();
		for (let cubelet of this.#cubelets) {
			cubelets.push(new CubeletState(cubelet.initialLocation.origin, cubelet.location.origin, cubelet.orientation.matrix));
		}
		return new CubeState(this.spec, cubelets);
	}

	async setState(newState: CubeState, source?: object): Promise<Cube> {

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

		await this.stateChanged.trigger({ oldState: oldState, newState: newState, source: source });

		return this;

	}

	async move(move: CubeMove, source?: object): Promise<Cube> {

		if (!this.spec.equals(move.spec)) throw new Error(`Invalid spec of move: ${move.spec}`);

		const oldState = this.getState();

		const dimension = move.face.dimension;
		const componentMaximum = (this.spec.edgeLength - 1) / 2;
		const startSliceComponent = (componentMaximum - (move.sliceStart - 1)) * (move.face.positiveDirection ? 1 : -1); // sliceStart is one-based
		const angle = (((move.angle * (move.face.positiveDirection ? 1 : -1) * -1) % 4) + 4) % 4; // rotateSlice rotates CCW

		let sliceComponent = startSliceComponent;
		for (let sliceIndex = 0; sliceIndex < move.sliceCount; sliceIndex++) {
			for (let angleIndex = 0; angleIndex < angle; angleIndex++) {
				for (let cubelet of this.#cubelets) {
					if (cubelet.location.origin.componentEquals(dimension, sliceComponent)) {
						cubelet.rotate(dimension);
					}
				}
			}
			sliceComponent += move.face.positiveDirection ? -1 : 1;
		}

		await this.stateChanged.trigger({ oldState: oldState, newState: this.getState(), move: move, source: source });

		return this;

	}

	// Generic Rotations

	async mRangeSlices(face: CubeFace, sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.move(new CubeMove(this.spec, face, sliceStart, sliceCount, angle), source);
	}

	async mBlockSlices(face: CubeFace, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(face, 1, sliceCount, angle, source);
	}

	async mFaceSlice(face: CubeFace, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(face, 1, angle, source);
	}

	async mCenterSlice(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), Math.floor((this.spec.edgeLength + 1) / 2), this.spec.edgeLength % 2, angle, source);
	}

	async mInlaySlices(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), 2, this.spec.edgeLength - 2, angle, source);
	}

	async mCube(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.getDimensionAndDirection(dimension, true), 1, this.spec.edgeLength, angle, source);
	}

	// Specific Range Rotations

	async mRightRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.RIGHT, sliceStart, sliceCount, angle, source);
	}

	async mUpRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.UP, sliceStart, sliceCount, angle, source);
	}

	async mFrontRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.FRONT, sliceStart, sliceCount, angle, source);
	}

	async mLeftRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.LEFT, sliceStart, sliceCount, angle, source);
	}

	async mDownRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.DOWN, sliceStart, sliceCount, angle, source);
	}

	async mBackRange(sliceStart: number = 2, sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mRangeSlices(CubeFace.BACK, sliceStart, sliceCount, angle, source);
	}

	// Specific Block Rotations

	async mRightBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.RIGHT, sliceCount, angle, source);
	}

	async mUpBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.UP, sliceCount, angle, source);
	}

	async mFrontBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.FRONT, sliceCount, angle, source);
	}

	async mLeftBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.LEFT, sliceCount, angle, source);
	}

	async mDownBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.DOWN, sliceCount, angle, source);
	}

	async mBackBlock(sliceCount: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mBlockSlices(CubeFace.BACK, sliceCount, angle, source);
	}

	// Specific Face Rotations

	async mRight(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.RIGHT, angle, source);
	}

	async mUp(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.UP, angle, source);
	}

	async mFront(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.FRONT, angle, source);
	}

	async mLeft(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.LEFT, angle, source);
	}

	async mDown(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.DOWN, angle, source);
	}

	async mBack(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mFaceSlice(CubeFace.BACK, angle, source);
	}

	// Specific Center Rotations

	async mMiddle(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCenterSlice(Dimension.X, angle, source);
	}

	async mEquator(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCenterSlice(Dimension.Y, angle, source);
	}

	async mStand(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCenterSlice(Dimension.Z, angle, source);
	}

	// Specific Center Rotations

	async mMiddleInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mInlaySlices(Dimension.X, angle, source);
	}

	async mEquatorInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mInlaySlices(Dimension.Y, angle, source);
	}

	async mStandInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mInlaySlices(Dimension.Z, angle, source);
	}

	// Specific Cube Rotations

	async mX(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCube(Dimension.X, angle, source);
	}

	async mY(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCube(Dimension.Y, angle, source);
	}

	async mZ(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: object): Promise<Cube> {
		return await this.mCube(Dimension.Z, angle, source);
	}

	// Others

	async mString(movesString: string, source?: object): Promise<Cube> {
		for (let move of this.getCubeMoveExporter().parse(movesString)) {
			await this.move(move, source)
		}
		return this;
	}

	async shuffleByMove(movesLength: number = 100, source?: object): Promise<Cube> {

		for (let moveIndex = 0; moveIndex < movesLength; moveIndex++) {
			const face = CubeFace.getByIndex(Random.randomIntegerToInclusivly(5));
			const sliceStart = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength);
			const sliceCount = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength - sliceStart + 1);
			const angle = Random.randomIntegerFromToInclusivly(1, 3);
			await this.mRangeSlices(face, sliceStart, sliceCount, angle, source);
		}

		return this;

	}

}