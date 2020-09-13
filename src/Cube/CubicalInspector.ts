/**import { CubicalSolvedCondition, ReadonlyCubical } from "./Cubical";
import { CubeDimension } from "./CubeGeometry";
import { AbstractCubePart, CubePartType } from "./CubePart";


export class CubicalInspector<T extends CubePartType> {

	readonly #predicates: Array<(cubicle: ReadonlyCubical<any>) => boolean>

	#negateNext: boolean

	constructor(readonly cubicals: ReadonlyArray<ReadonlyCubical<any>>, predicates: ReadonlyArray<(cubicle: ReadonlyCubical<any>) => boolean> = [], negateNext: boolean = false) {
		this.#predicates = [...predicates];
		this.#negateNext = negateNext;
	}

	withPredicate(predicate: (cubicle: ReadonlyCubical<any>) => boolean) {
		if (this.#negateNext) {
			predicate = cubical => !predicate.call(this, cubical);
			this.#negateNext = false;
		}
		this.#predicates.push(predicate);
		return this;
	}

	not(): CubicalInspector<T> {
		this.#negateNext = true;
		return this;
	}

	withType<NT extends CubePartType>(type: NT): CubicalInspector<NT> {
		this.withPredicate(cubical => cubical.type === type);
		return new CubicalInspector<NT>(this.cubicals, this.#predicates, this.#negateNext);
	}

	corners(): CubicalInspector<CubePartType.CORNER> {
		return this.withType(CubePartType.CORNER);
	}

	edges(): CubicalInspector<CubePartType.EDGE> {
		return this.withType(CubePartType.EDGE);
	}

	faces(): CubicalInspector<CubePartType.FACE> {
		return this.withType(CubePartType.FACE);
	}

	at(part: AbstractCubePart<any>): CubicalInspector<T> {
		return this.withPredicate(cubical => cubical.location.isIn(part));
	}

	atCoordinate(dimension: CubeDimension, value: number): CubicalInspector<T> {
		return this.withPredicate(cubical => cubical.location.coordinates.matches(dimension, value));
	}

	atX(value: number): CubicalInspector<T> {
		return this.atCoordinate(CubeDimension.X, value);
	}

	atY(value: number): CubicalInspector<T> {
		return this.atCoordinate(CubeDimension.Y, value);
	}

	atZ(value: number): CubicalInspector<T> {
		return this.atCoordinate(CubeDimension.Z, value);
	}

	along(dimension: CubeDimension) {
		return this.withPredicate(cubical => cubical.location.isAlong(dimension));
	}

	alongX() {
		return this.along(CubeDimension.X);
	}

	alongY() {
		return this.along(CubeDimension.Y);
	}

	alongZ() {
		return this.along(CubeDimension.Z);
	}

	initiallyAt(part: AbstractCubePart<any>): CubicalInspector<T> {
		return this.withPredicate(cubical => cubical.initialLocation.isIn(part));
	}

	initiallyAtCoordinate(dimension: CubeDimension, value: number): CubicalInspector<T> {
		return this.withPredicate(cubical => cubical.initialLocation.coordinates.matches(dimension, value));
	}

	initiallyAtX(value: number): CubicalInspector<T> {
		return this.initiallyAtCoordinate(CubeDimension.X, value);
	}

	initiallyAtY(value: number): CubicalInspector<T> {
		return this.initiallyAtCoordinate(CubeDimension.Y, value);
	}

	initiallyAtZ(value: number): CubicalInspector<T> {
		return this.initiallyAtCoordinate(CubeDimension.Z, value);
	}

	initiallyAlong(dimension: CubeDimension) {
		return this.withPredicate(cubical => cubical.initialLocation.isAlong(dimension));
	}

	initiallyAlongX() {
		return this.initiallyAlong(CubeDimension.X);
	}

	initiallyAlongY() {
		return this.initiallyAlong(CubeDimension.Y);
	}

	initiallyAlongZ() {
		return this.initiallyAlong(CubeDimension.Z);
	}

	solved(customCondition?: CubicalSolvedCondition) {
		return this.withPredicate(cubical => cubical.isSolved(customCondition));
	}

	//TODO: Something with orientation

	private checkTermination() {
		if (this.#negateNext) throw new Error('Cannot use not() before a terminator');
	}

	findAll(): ReadonlyArray<ReadonlyCubical<T>> {
		this.checkTermination();
		const me = this;
		return this.cubicals.filter((cubical) => {
			for (let filter of me.#predicates) {
				if (!filter.call(undefined, cubical)) return false;
			}
			return true;
		}).map((cubical) => cubical as ReadonlyCubical<T>);
	}

	findFirst(): ReadonlyCubical<T> | undefined {
		this.checkTermination();
		const me = this;
		const result = this.cubicals.find((cubical) => {
			for (let filter of me.#predicates) {
				if (!filter.call(undefined, cubical)) return false;
			}
			return true;
		});
		if (result === undefined) return undefined;
		return result as ReadonlyCubical<T>;
	}

	findOne(): ReadonlyCubical<T> {
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

} */