import { CubicalSolvedCondition, ReadonlyCubical, Cubical } from "./Cubical";
import { CubeDimension, CubeCoordinates } from "../Linear Algebra/Vector";
import { CubePartType, CubePart } from "../Cube Geometry/CubePart";


export class CubicalInspector {

	readonly #cubicals: ReadonlyArray<Cubical>

	readonly #predicates: Array<(cubicle: ReadonlyCubical) => boolean>

	#negateNext: boolean

	constructor(cubicals: ReadonlyArray<Cubical>) {
		this.#cubicals = cubicals;
		this.#predicates = [];
		this.#negateNext = false;
	}

	withPredicate(predicate: (cubicle: ReadonlyCubical) => boolean) {
		if (this.#negateNext) {
			predicate = cubical => !predicate.call(this, cubical);
			this.#negateNext = false;
		}
		this.#predicates.push(predicate);
		return this;
	}

	not(): CubicalInspector {
		this.#negateNext = true;
		return this;
	}

	withType(type: CubePartType): CubicalInspector {
		return this.withPredicate(cubical => cubical.type === type);
	}

	corners(): CubicalInspector {
		return this.withType(CubePartType.CORNER);
	}

	edges(): CubicalInspector {
		return this.withType(CubePartType.EDGE);
	}

	faces(): CubicalInspector {
		return this.withType(CubePartType.FACE);
	}

	inPart(part: CubePart): CubicalInspector {
		return this.withPredicate(cubical => cubical.location.part === part);
	}

	adjectedTo(part: CubePart): CubicalInspector {
		return this.withPredicate(cubical => cubical.location.isAdjectedTo(part));
	}

	atCoordinates(coordinates: CubeCoordinates): CubicalInspector {
		return this.withPredicate(cubical => cubical.location.coordinates.equals(coordinates));
	}

	atCoordinate(dimension: CubeDimension, value: number): CubicalInspector {
		return this.withPredicate(cubical => cubical.location.coordinates.coordinateEquals(dimension, value));
	}

	atX(value: number): CubicalInspector {
		return this.atCoordinate(CubeDimension.X, value);
	}

	atY(value: number): CubicalInspector {
		return this.atCoordinate(CubeDimension.Y, value);
	}

	atZ(value: number): CubicalInspector {
		return this.atCoordinate(CubeDimension.Z, value);
	}

	along(dimension: CubeDimension): CubicalInspector {
		return this.withPredicate(cubical => cubical.location.isAlong(dimension));
	}

	alongX(): CubicalInspector {
		return this.along(CubeDimension.X);
	}

	alongY(): CubicalInspector {
		return this.along(CubeDimension.Y);
	}

	alongZ(): CubicalInspector {
		return this.along(CubeDimension.Z);
	}

	initiallyInPart(part: CubePart): CubicalInspector {
		return this.withPredicate(cubical => cubical.initialLocation.part === part);
	}

	initiallyAdjectedTo(part: CubePart): CubicalInspector {
		return this.withPredicate(cubical => cubical.initialLocation.isAdjectedTo(part));
	}

	initiallyAtCoordinates(coordinates: CubeCoordinates): CubicalInspector {
		return this.withPredicate(cubical => cubical.initialLocation.coordinates.equals(coordinates));
	}

	initiallyAtCoordinate(dimension: CubeDimension, value: number): CubicalInspector {
		return this.withPredicate(cubical => cubical.initialLocation.coordinates.coordinateEquals(dimension, value));
	}

	initiallyAtX(value: number): CubicalInspector {
		return this.initiallyAtCoordinate(CubeDimension.X, value);
	}

	initiallyAtY(value: number): CubicalInspector {
		return this.initiallyAtCoordinate(CubeDimension.Y, value);
	}

	initiallyAtZ(value: number): CubicalInspector {
		return this.initiallyAtCoordinate(CubeDimension.Z, value);
	}

	initiallyAlong(dimension: CubeDimension): CubicalInspector {
		return this.withPredicate(cubical => cubical.initialLocation.isAlong(dimension));
	}

	initiallyAlongX(): CubicalInspector {
		return this.initiallyAlong(CubeDimension.X);
	}

	initiallyAlongY(): CubicalInspector {
		return this.initiallyAlong(CubeDimension.Y);
	}

	initiallyAlongZ(): CubicalInspector {
		return this.initiallyAlong(CubeDimension.Z);
	}

	solved(customCondition?: CubicalSolvedCondition): CubicalInspector {
		return this.withPredicate(cubical => cubical.isSolved(customCondition));
	}

	//TODO: Something with orientation

	private checkTermination() {
		if (this.#negateNext) throw new Error('Cannot use not() before a terminator');
	}

	findAll(): ReadonlyArray<ReadonlyCubical> {
		this.checkTermination();
		return this.#cubicals.filter((cubical) => {
			for (let filter of this.#predicates) {
				if (!filter.call(undefined, cubical)) return false;
			}
			return true;
		});
	}

	findFirst(): ReadonlyCubical | undefined {
		this.checkTermination();
		const result = this.#cubicals.find((cubical) => {
			for (let filter of this.#predicates) {
				if (!filter.call(undefined, cubical)) return false;
			}
			return true;
		});
		if (result === undefined) return undefined;
		return result;
	}

	findOne(): ReadonlyCubical {
		this.checkTermination();
		const result = this.findAll();
		if (result.length !== 1) throw new Error(`Invalid result length: ${result.length}`);
		return result[0];
	}

	count(): number {
		this.checkTermination();
		return this.findAll().length;
	}

	exist(): boolean {
		this.checkTermination();
		return this.findFirst() !== undefined;
	}

	dontExist(): boolean {
		this.checkTermination();
		return this.count() === 0;
	}

	areSolved(customCondition?: CubicalSolvedCondition): boolean {
		this.checkTermination();
		return this.findAll().every(cubical => cubical.isSolved(customCondition));
	}

	areUnsolved(customCondition?: CubicalSolvedCondition): boolean {
		this.checkTermination();
		return this.findAll().every(cubical => !cubical.isSolved(customCondition));
	}

}