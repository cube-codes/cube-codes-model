import { CubeMoveLanguage } from "../Cube Move/CubeMoveLanguage";
import { CubeStateLanguage } from '../Cube State/CubeStateLanguage';
import { CubeState } from '../Cube State/CubeState';
import { Cubical, CubicalSolvedCondition, CubicalLocation, ReadonlyCubical } from './Cubical';
import { Random } from '../Utilities/Random';
import deepEqual from "deep-equal";
import { CubicalInspector } from "./CubicalInspector";
import { EventData } from "../Events/EventData";
import { CubeMove } from "../Cube Move/CubeMove";
import { Printable } from "../Interfaces/Printable";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Event } from "../Events/Event";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubePart } from "../Cube Geometry/CubePart";
import { Dimension } from "../Linear Algebra/Dimension";
import { CubeMoveAngle } from "../Cube Move/CubeMoveAngle";
import { CubeFace } from "../Cube Geometry/CubeFace";


export interface CubeStateChanged extends EventData {
	readonly oldState: CubeState
	readonly newState: CubeState
	readonly move?: CubeMove
}

export class Cube implements Printable {

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

	readonly #cubicals: ReadonlyArray<Cubical>

	constructor(
		readonly spec: CubeSpecification, customSolvedCondition?: CubicalSolvedCondition, state?: CubeState) {

		this.solvedCondition = customSolvedCondition ?? Cube.defaultSolvedCondition(this.spec);

		const cubicals = new Array<Cubical>();
		for (const cubePartType of CubePartType.getAll()) {
			for (const cubePart of CubePart.getByType(cubePartType)) {
				for (const cubicalLocation of CubicalLocation.fromPart(spec, cubePart)) {
					cubicals.push(new Cubical(this, cubicalLocation)); //new Cubical in initial location and orientation
				}
			}
		}
		this.#cubicals = cubicals;

		if (state) {
			this.setState(state);
		}
	}

	clone(): Cube {
		return new Cube(this.spec, this.solvedCondition, this.getState());
	}

	toString(): string {
		let result: string = 'All Cubicals:\n ';
		for (let cubical of this.#cubicals) {
			result = result + cubical.toString() + '\n';
		}
		return result;
	}

	get cubicals(): CubicalInspector {
		return new CubicalInspector(this.#cubicals);
	}

	getStateLanguage(): CubeStateLanguage {
		return new CubeStateLanguage(this.spec);
	}

	getMoveLanguage(): CubeMoveLanguage {
		return new CubeMoveLanguage(this.spec);
	}

	isSolved(customCondition?: CubicalSolvedCondition): boolean {
		return this.cubicals.areSolved(customCondition);
	}

	getState(): CubeState {
		return CubeState.snapshotFromCubicals(this.spec, this.#cubicals as ReadonlyArray<ReadonlyCubical>);
	}

	setState(newState: CubeState, source?: object): Cube {

		if (!deepEqual(this.spec, newState.spec)) throw new Error(`Invalid spec of new state: ${newState.spec}`); //TODO: Only check for equality to allow worker messaging

		const oldState = this.getState();

		newState.restoreIntoCubicals(this.#cubicals);

		this.stateChanged.trigger({ oldState: oldState, newState: newState, source: source });

		return this;

	}

	private rotateSlice(dimension: Dimension, sliceCoordinate: number): void {

		for (let cubical of this.#cubicals) {
			if (sliceCoordinate === cubical.location.coordinates.getComponent(dimension)) {
				cubical.rotate(dimension);
			}
		}

	}

	move(move: CubeMove, source?: object): Cube {

		if (!deepEqual(this.spec, move.spec)) throw new Error(`Invalid spec of move: ${move.spec}`); //TODO: Only check for equality to allow worker messaging

		if (move.angle % 4 === 0) return this;

		const oldState = this.getState();

		const dimension = move.face.dimension;
		const firstSliceCoordinate = move.face.frontside ? 0 : this.spec.edgeLength - move.slices;
		const lastSliceCoordinate = move.face.frontside ? move.slices - 1 : this.spec.edgeLength - 1;
		const angle = (((move.face.frontside ? 1 : -1) * move.angle % 4) + 4) % 4;

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
		this.getMoveLanguage().parse(movesString).forEach(move => this.move(move, source));
		return this;
	}

	shuffleByExplosion(source?: object): Cube {

		const permutations = [new Array<number>(), new Array<number>(), new Array<number>()];
		const orientations = [new Array<number>(), new Array<number>(), new Array<number>()];

		for (const type of CubePartType.getAll()) {

			const n = type.countLocations(this.spec);
			//RandomPermutation of 1...n
			//Make a pool of all indices, choose a random one, then delete it from the pool etc
			const indexPool = Array<number>();
			for (let index = 0; index < n; index++) { indexPool.push(index); }
			for (let initialindex = 0; initialindex < n; initialindex++) { //Until indexPool is empty
				let indexindex = Random.randomIntegerFromToInclusivly(0, indexPool.length - 1);
				permutations[type.dimensionsCount][initialindex] = indexPool[indexindex];
				indexPool.splice(indexindex, 1);
				//Also random orientation
				orientations[type.dimensionsCount][initialindex] = Random.randomIntegerFromToInclusivly(0, type.countNormalVectors() - 1);
			}

		}

		this.setState(new CubeState(this.spec, permutations, orientations));
		
		return this;

	}

	shuffleByMove(moveLength: number = 100, source?: object): Cube {
		
		for (let moveIndex = 0; moveIndex < moveLength; moveIndex++) {
			const face = CubeFace.getAll()[Random.randomIntegerToInclusivly(5)];
			const slices = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength - 1);
			const angle = Random.randomIntegerFromToInclusivly(1, 3);
			this.mw(face, slices, angle, source);
		}

		return this;
	
	}

	shuffle(moveLength: number = 100, source?: object): Cube {
		return this.shuffleByMove(moveLength, source);
	}

	getOrbit():String {
		if (this.spec.edgeLength!=3 || this.spec.colored!=true) throw new Error('Orbit problem only solved and implemented for SPEC (3, ColoredFaces)');
		let state:CubeState=this.getState();
		//Careful, since the cube can be rotated in space, the face permutations also have to be encountered
		let CornerPermutationsVsEdgePermutationsSignum=Cube.getSignum(state.permutations[0])*Cube.getSignum(state.permutations[1])*Cube.getSignum(state.permutations[2]);

		let CornerReorientationsSum=0;
		for(let index=0;index<CubePartType.CORNER.countLocations(this.spec);index++) {
			CornerReorientationsSum+=state.reorientations[0][index];
		}
		let EdgeReorientationsSum=0;
		for(let index=0;index<CubePartType.EDGE.countLocations(this.spec);index++) {
			EdgeReorientationsSum+=state.reorientations[1][index];
		}
		return "Orbit: Signums="+CornerPermutationsVsEdgePermutationsSignum.toString()
		+", CornerOrientations="+ (CornerReorientationsSum % 3).toString()
		+", EdgeOrientations="+ (EdgeReorientationsSum %2) .toString();
		
	}

	/** Computes the signum of a permutation, used in getOrbit
	 * 
	 */
	private static getSignum(permutation:ReadonlyArray<number>):number  {
		let signumCount=0;
		for (let i:number=0;i<permutation.length;i++) {
			for (let j:number=i+1;j<permutation.length;j++) {
				if (permutation[i]>permutation[j]) signumCount++;
			}
		}
		//console.log(permutation);
		//console.log("SignumCount:"+signumCount);
		return Math.pow(-1,signumCount);
	}

}