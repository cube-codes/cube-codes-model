import { CubeState } from '../Cube State/CubeState';
import { Cubelet } from './Cubelet';
import { CubeMove } from "../Cube Move/CubeMove";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Event } from "../Event/Event";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubePart } from "../Cube Geometry/CubePart";
import { CubeStateChanged } from "./CubeStateChanged";
import { CubeletLocation } from "./CubeletLocation";
import { CubeSolutionCondition } from "./CubeSolutionCondition";
import { CubeletState } from "../Cube State/CubeletState";
import { CubeletOrientation } from "./CubeletOrientation";
import { ReadonlyCubelet } from "./ReadonlyCubelet";
import { CubeletInspector } from './CubeletInspector';
import { Vector } from '../Linear Algebra/Vector';
import { Matrix } from '../Linear Algebra/Matrix';

export class Cube {
	
	/**
	 * @event
	 */
	readonly stateChanged = new Event<CubeStateChanged>();

	readonly #cubelets: ReadonlyArray<Cubelet>

	constructor(
		readonly spec: CubeSpecification, readonly solutionCondition: CubeSolutionCondition, state?: CubeState) {

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

	clone(): Cube {
		return new Cube(this.spec, this.solutionCondition, this.getState());
	}

	get cubelets(): ReadonlyArray<ReadonlyCubelet> {
		return this.#cubelets;
	}

	getInspector(): CubeletInspector {
		return new CubeletInspector(this.#cubelets);
	}

	isSolved(): boolean {
		return this.solutionCondition.isCubeSolved(this);
	}

	getState(): CubeState {
		const cubelets = new Array<CubeletState>();
		for (let cubelet of this.#cubelets) {
			cubelets.push(new CubeletState(cubelet.initialLocation.origin, cubelet.currentLocation.origin, cubelet.currentOrientation.matrix));
		}
		return new CubeState(this.spec, cubelets);
	}

	async setState(newState: CubeState, source?: object): Promise<Cube> {

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

		const oldState = this.getState();

		const dimension = move.face.dimension;
		const componentMaximum = (this.spec.edgeLength - 1) / 2;
		const startSliceComponent = (componentMaximum - (move.sliceStart - 1)) * (move.face.positiveDirection ? 1 : -1); // sliceStart is one-based
		const angle = (((move.angle * (move.face.positiveDirection ? 1 : -1) * -1) % 4) + 4) % 4; // rotateSlice rotates CCW

		let sliceComponent = startSliceComponent;
		for (let sliceIndex = 0; sliceIndex <= move.sliceEnd - move.sliceStart; sliceIndex++) {
			for (let angleIndex = 0; angleIndex < angle; angleIndex++) {
				for (let cubelet of this.#cubelets) {
					if (cubelet.currentLocation.origin.componentEquals(dimension, sliceComponent)) {
						cubelet.rotate(dimension);
					}
				}
			}
			sliceComponent += move.face.positiveDirection ? -1 : 1;
		}

		await this.stateChanged.trigger({ oldState: oldState, newState: this.getState(), move: move, source: source });

		return this;

	}

	getPerspectiveFromFaceMids():Matrix {
		const maxComponent=this.spec.edgeLength/2-0.5;
		if(this.spec.edgeLength % 2 == 0) throw Error('getPerspectiveFromFaceMids() only implemented for odd cubes');
		let fromX=new Vector([maxComponent,0,0]);
		let fromY=new Vector([0,maxComponent,0]);
		let fromZ=new Vector([0,0,maxComponent]);
		let toX=this.getInspector().initiallyAtOrigin(fromX).findOne().currentLocation.origin;
		let toY=this.getInspector().initiallyAtOrigin(fromY).findOne().currentLocation.origin;
		let toZ=this.getInspector().initiallyAtOrigin(fromZ).findOne().currentLocation.origin;
		return Matrix.forBaseChange([fromX,fromY,fromZ],[toX,toY,toZ]);	
	}
	

}