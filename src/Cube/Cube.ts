import { EventData, Event } from "../Utilities/Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";
import { CubeSpecification, CubeDimension, CubeCoordinates } from './CubeGeometry';
import { CubeStateLanguage } from './CubeStateLanguage';
import { CubeMoveAngle, CubeMove } from './CubeMove';
import { CubeState } from './CubeState';
import { Cubical, CubicalSolvedCondition, CubicalLocation } from './Cubical';
import { Random } from '../Utilities/Random';
import { CubeFace, CubePart, CubePartTypes } from './CubePart';
//TODO SORRY import { CubicalInspector } from "./CubicalInspector";
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

	readonly #cubicals: ReadonlyArray<Cubical>

	/** Generates a Solved Cube */
	constructor(
		readonly spec: CubeSpecification, customSolvedCondition?: CubicalSolvedCondition, state?: CubeState) {

		this.solvedCondition = customSolvedCondition ?? Cube.defaultSolvedCondition(this.spec);
		
		const cubicals = new Array<Cubical>();
		for(const cubePartType of CubePartTypes.ALL) {
			for(const cubePart of CubePart.ALL[cubePartType]) {
				for(const cubicalLocation of CubicalLocation.getAll(spec,cubePart)) {
					cubicals.push(new Cubical(this, cubicalLocation)); //new Cubical in initial location and orientation
				}
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

	/** TODO SORRY
	get cubicals(): CubicalInspector<any> {
		return new CubicalInspector(this.#cubicals);
	}*/

	getStateLanguage(): CubeStateLanguage {
		return new CubeStateLanguage(this.spec);
	}

	getMoveLanguage(): CubeMoveLanguage {
		return new CubeMoveLanguage(this.spec);
	}

	/** TODO SORRY
	isSolved(customCondition?: CubicalSolvedCondition): boolean {
		return this.cubicals.areSolved(customCondition);
	}*/

	getState(): CubeState {
		let permutations = [new Array<number>(),new Array<number>(),new Array<number>()];
		let orientations = [new Array<number>(),new Array<number>(),new Array<number>()];
		let logstring='getState: ';
		for(let cubical of this.#cubicals) {
			permutations[cubical.getType()][CubeState.indexFromLocation(this.spec,cubical.initialLocation)]=CubeState.indexFromLocation(this.spec,cubical.location)
			orientations[cubical.getType()][CubeState.indexFromLocation(this.spec,cubical.initialLocation)]=CubeState.reorientationNumberFromMatrix(cubical.initialLocation.cubePart,cubical.location.cubePart,cubical.orientation);
			logstring=logstring+' At['+CubeState.indexFromLocation(this.spec,cubical.initialLocation).toString()+']'+cubical.toString()+" ";
		}
		logstring=logstring+permutations.toString()+orientations.toString();
		//console.log(logstring);
		return new CubeState(this.spec,permutations, orientations);
	}

	getCubicalAt(location:CubeCoordinates):Cubical {
		for(let cubical of this.#cubicals) {
			if (deepEqual(cubical.location.coordinates, location)) return cubical;
		}
		throw new Error('No cubical at coordinates '+location.toString());
	}

	
	getCubicalFrom(initialLocation:CubeCoordinates):Cubical {
		for(let cubical of this.#cubicals) {
			if (deepEqual(cubical.initialLocation.coordinates, initialLocation)) return cubical;
		}
		throw new Error('No cubical from coordinates '+initialLocation.toString());
	}

	/** Generates new cubicals */
	setState(newState: CubeState, source?: object): Cube {

		if (!deepEqual(this.spec, newState.spec)) throw new Error(`Invalid spec of new state: ${newState.spec}`);
		
		const oldState = this.getState();
		
		//Set position and orientation of all cubicals
		for(let cubical of this.#cubicals) {
			let type=cubical.getType();
			let index=CubeState.indexFromLocation(this.spec,cubical.initialLocation);
			cubical.location=CubeState.indexToLocation(this.spec,newState.permutations[type][index],type); 
			cubical.orientation=CubeState.reorientationNumberToMatrix(cubical.initialLocation.cubePart,cubical.location.cubePart,newState.reorientations[type][index]);
		}
		
		//Inform 

		this.stateChanged.trigger({ oldState: oldState, newState: newState, source: source });
		
		return this;
	
	}

	rotateSlice(dimension: CubeDimension, sliceCoordinate: number): void {

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
		
		const dimension = move.face.dimension;
		const firstSliceCoordinate = move.face.backside ? 0 : this.spec.edgeLength - move.slices;
		const lastSliceCoordinate = move.face.backside ? move.slices - 1 : this.spec.edgeLength - 1;
		const angle = (((move.face.backside ? move.angle : -move.angle) % 4) + 4) % 4;

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
		let permutations=[new Array<number>(),new Array<number>(),new Array<number>()];
		let orientations=[new Array<number>(),new Array<number>(),new Array<number>()];

		for(let type of CubePartTypes.ALL) {
			let n=CubeState.countLocations(this.spec,type);
			//RandomPermutation of 1...n
			//Make a pool of all indices, choose a random one, then delete it from the pool etc
			let indexPool=Array<number>();
			for (let index=0;index<n;index++) {indexPool.push(index);}
			for (let initialindex=0;initialindex<n;initialindex++) { //Until indexPool is empty
				let indexindex= Random.randomIntegerFromToInclusivly(0, indexPool.length - 1);
				permutations[type][initialindex]=indexPool[indexindex];
				indexPool.splice(indexindex, 1);
				//Also random orientation
				orientations[type][initialindex]= Random.randomIntegerFromToInclusivly(0, CubePartTypes.countNormalVectors(type)-1);
			}
		}
		this.setState(new CubeState(this.spec, permutations,orientations));
		return this;
	}
	
	shuffleByMove(moveLength: number = 100, source?: object): Cube {
		for (let moveIndex = 0; moveIndex < moveLength; moveIndex++) {
			const face = CubeFace.ALL[Random.randomIntegerToInclusivly(5)];
			const slices = Random.randomIntegerFromToInclusivly(1, this.spec.edgeLength - 1);
			const angle = Random.randomIntegerFromToInclusivly(1, 3);
			this.mw(face, slices, angle, source);
		}
		return this;
	}
	
	shuffle(moveLength: number = 100, source?: object): Cube {
		return this.shuffleByMove(moveLength, source);
	}

	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	public toFormattedString(): string {
		let result:string='All Cubicals:\n ';
		for(let cubical of this.#cubicals) {
			result=result+ cubical.toString()+'\n';
		}
		return result;
	}


}