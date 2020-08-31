import { EventData, Event } from "./Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";
import { Permutation } from "./Permutation";
var deepEqual = require('deep-equal')

export class CubeSpecification {
	constructor(
		readonly edgeLength: number) {
		if (!Number.isInteger(edgeLength) || edgeLength < 2 || edgeLength > 8) throw 'Invalid edge length';
	}
}

export class CubeState {
	constructor(
		readonly spec: CubeSpecification,
		readonly edgePermutation: Permutation) {
	}
	static fromSolved(spec: CubeSpecification) {
		return new CubeState(spec, Permutation.fromTrivial(12 * (spec.edgeLength - 2)));
	}
	move(move: CubeMove) {
		return new CubeState(this.spec, this.value + move.angle);
	}
	private moveAroundAxis(dimension: CubeDimension, sliceCoordinate: number) {
		for(let edgeCubicleIndex = 0; edgeCubicleIndex < 12 * (this.spec.edgeLength - 2); edgeCubicleIndex++) {
			let c = new EdgeCubicle(this.spec, edgeCubicleIndex);
			let coordinateAtDimension = c.coordinates.getComponent(dimension);
			let coordinateAfterDimension = +c.coordinates.getComponent((dimension+2)%3)+0;
			let coordinateBeforeDimension = -c.coordinates.getComponent((dimension+1)%3)+this.spec.edgeLength;
			let co = new CubeCoordinates(0,0,0).withValue((dimension+2)%3, coordinateBeforeDimension).withValue(dimension, coordinateAtDimension).withValue((dimension+1)%3, coordinateAfterDimension);
		}
	}
	/*
	getLocationOfCubicle(v: Cubicle): Location
	getCubicleAt(v: Location): Cubical
	getOrientationAt<T>(v: Location<T>): Orientation<T>
	getOrientationOn<T>(v: Cubicle<T>): Orientation<T>
	isSolved: boolean
	isLocationSolved(v: Cubicle): boolean
	isCubicleSolved(v: Location): boolean
	*/

}

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

export class CubeCoordinates {
	constructor(readonly x: number,
		readonly y: number,
		readonly z: number) { }
	static fromDimension(dimension: CubeDimension, value: number) {
		switch (dimension) {
			case CubeDimension.X:
				return new CubeCoordinates(value, 0, 0);
			case CubeDimension.Y:
				return new CubeCoordinates(0, value, 0);
			case CubeDimension.Z:
				return new CubeCoordinates(0, 0, value);
			default:
				throw 'Unknonwn dimension';
		}
	}
	getComponent(dimension: CubeDimension) {
		switch (dimension) {
			case CubeDimension.X:
				return this.x;
			case CubeDimension.Y:
				return this.y;
			case CubeDimension.Z:
				return this.z;
			default:
				throw 'Unknonwn dimension';
		}
	}
	add(summand: CubeCoordinates) {
		return new CubeCoordinates(this.x + summand.x, this.y + summand.y, this.z + summand.z);
	}
	substract(subtrahend: CubeCoordinates) {
		return new CubeCoordinates(this.x - subtrahend.x, this.y - subtrahend.y, this.z - subtrahend.z);
	}
	multiply(factor: number) {
		return new CubeCoordinates(this.x * factor, this.y * factor, this.z * factor);
	}
	withValue(dimension: CubeDimension, value: number) {
		switch (dimension) {
			case CubeDimension.X:
				return new CubeCoordinates(value, this.y, this.z);
			case CubeDimension.Y:
				return new CubeCoordinates(this.x, value, this.z);
			case CubeDimension.Z:
				return new CubeCoordinates(this.x, this.y, value);
			default:
				throw 'Unknonwn dimension';
		}
	}
}

export class EdgeCubicle {
	readonly edge: CubeEdge
	readonly coordinates: CubeCoordinates
	constructor(readonly spec: CubeSpecification, readonly index: number) {
		let lastCoordinate = index % (spec.edgeLength - 2);
		this.edge = new CubeEdge(spec, Math.floor(index / (spec.edgeLength - 2)));
		this.coordinates = this.edge.coordinates.add(CubeCoordinates.fromDimension(this.edge.dimension, lastCoordinate + 1));
	}
	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates) {
		let dimension: CubeDimension = null;
		let lastCoordinates: number = null;
		let edgeCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension = CubeDimension.X;
			lastCoordinates = coordinates.x - 1;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension !== null) throw 'Coordinate of MidCubicle or inside cube';
			dimension = CubeDimension.Y;
			lastCoordinates = coordinates.y - 1;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Y, 0);
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension !== null) throw 'Coordinate of MidCubicle or inside cube';
			dimension = CubeDimension.Z;
			lastCoordinates = coordinates.z - 1;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Z, 0);
		}
		if (dimension === null) throw 'Coordinate of CornerCubicle';
		let edge = CubeEdge.fromDimension(spec, dimension, edgeCoordinates);
		let index = (edge.index * (spec.edgeLength - 2)) + lastCoordinates;
		return new EdgeCubicle(spec, index);
	}
}

export class CubeEdge {
	readonly dimension: CubeDimension
	readonly coordinates: CubeCoordinates
	constructor(readonly spec: CubeSpecification, readonly index: number) {
		if (!Number.isInteger(index) || index < 0 || index > 11) throw 'Invalid index';
		switch (this.index) {
			case 0:
				this.dimension = CubeDimension.X;
				this.coordinates = new CubeCoordinates(0, this.spec.edgeLength - 1, 0);
				break;
			case 1:
				this.dimension = CubeDimension.Z;
				this.coordinates = new CubeCoordinates(this.spec.edgeLength - 1, this.spec.edgeLength - 1, 0);
				break;
			case 2:
				this.dimension = CubeDimension.X;
				this.coordinates = new CubeCoordinates(0, this.spec.edgeLength - 1, this.spec.edgeLength - 1);
				break;
			case 3:
				this.dimension = CubeDimension.Z;
				this.coordinates = new CubeCoordinates(0, this.spec.edgeLength - 1, 0);
				break;
			case 4:
				this.dimension = CubeDimension.Y;
				this.coordinates = new CubeCoordinates(0, 0, 0);
				break;
			case 5:
				this.dimension = CubeDimension.Y;
				this.coordinates = new CubeCoordinates(this.spec.edgeLength - 1, 0, 0);
				break;
			case 6:
				this.dimension = CubeDimension.Y;
				this.coordinates = new CubeCoordinates(this.spec.edgeLength - 1, 0, this.spec.edgeLength - 1);
				break;
			case 7:
				this.dimension = CubeDimension.Y;
				this.coordinates = new CubeCoordinates(0, 0, this.spec.edgeLength - 1);
				break;
			case 8:
				this.dimension = CubeDimension.X;
				this.coordinates = new CubeCoordinates(0, 0, 0);
				break;
			case 9:
				this.dimension = CubeDimension.Z;
				this.coordinates = new CubeCoordinates(this.spec.edgeLength - 1, 0, 0);
				break;
			case 10:
				this.dimension = CubeDimension.X;
				this.coordinates = new CubeCoordinates(0, 0, this.spec.edgeLength - 1);
				break;
			case 11:
				this.dimension = CubeDimension.Z;
				this.coordinates = new CubeCoordinates(0, 0, 0);
				break;
		}
	}
	static fromDimension(spec: CubeSpecification, dimension: CubeDimension, coordinates: CubeCoordinates): CubeEdge {
		if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, spec.edgeLength - 1, 0))) {
			return new CubeEdge(spec, 0);
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(spec.edgeLength - 1, spec.edgeLength - 1, 0))) {
			return new CubeEdge(spec, 1);
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, spec.edgeLength - 1, spec.edgeLength - 1))) {
			return new CubeEdge(spec, 2);
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, spec.edgeLength - 1, 0))) {
			return new CubeEdge(spec, 3);
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			return new CubeEdge(spec, 4);
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(spec.edgeLength - 1, 0, 0))) {
			return new CubeEdge(spec, 5);
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(spec.edgeLength - 1, 0, spec.edgeLength - 1))) {
			return new CubeEdge(spec, 6);
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, spec.edgeLength - 1))) {
			return new CubeEdge(spec, 7);
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			return new CubeEdge(spec, 8);
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(spec.edgeLength - 1, 0, 0))) {
			return new CubeEdge(spec, 9);
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 0, spec.edgeLength - 1))) {
			return new CubeEdge(spec, 10);
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			return new CubeEdge(spec, 11);
		} else {
			throw 'Invalid input parameters'
		}
	}
}

export enum CubeDimension {
	X = 0, // R -> L
	Y = 1, // U -> D
	Z = 2  // F -> B
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
	CC90 = -1
}

export class CubeMove {
	constructor(readonly spec: CubeSpecification,
		readonly face: number | CubeFace,
		readonly slices: number,
		readonly angle: number | CubeAngle) {
		if (!Number.isInteger(face) || face < 0 || face > 5) throw 'Invalid face';
		if (!Number.isInteger(slices) || slices < 1 || slices > this.spec.edgeLength) throw 'Invalid slices';
		if (!Number.isInteger(angle)) throw 'Invalid angel';
	}
	getInverse(): CubeMove {
		return new CubeMove(this.spec, this.face, this.slices, -this.angle);
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
		if (newState.spec !== oldState.spec) throw 'Invalid new spec';
		this.state = newState;
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, source: source });
		return this;
	}

	move(move: CubeMove, source?: object) {
		if (move.angle % 4 === 0) return this;
		let oldState = this.state;
		this.state = this.state.move(move);
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, move: move, source: source });
		return this;
	}

	mw(face: number | CubeFace, slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.move(new CubeMove(this.state.spec, face, slices, angle), source);
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
		return this.mw(face, this.state.spec.edgeLength, angle, source);
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

	getMoveLanguage() {
		return new CubeMoveLanguage(this.state.spec);
	}

	ml(movesString: string, source?: object) {
		this.getMoveLanguage().parse(movesString).forEach(function (move) {
			this.move(move, source);
		});
		return this;
	}

}