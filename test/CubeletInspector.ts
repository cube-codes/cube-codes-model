import { CubePart } from "../src/Cube Geometry/CubePart";
import { CubePartType } from "../src/Cube Geometry/CubePartType";
import { Dimension } from "../src/Linear Algebra/Dimension";
import { Vector } from "../src/Linear Algebra/Vector";
import { ReadonlyCubelet } from "../src/Cube/ReadonlyCubelet";

export class CubeletInspector {

	readonly #cubelets: ReadonlyArray<ReadonlyCubelet>

	readonly #predicates: Array<(cubelet: ReadonlyCubelet) => boolean>

	#negateNext: boolean

	constructor(cubelets: ReadonlyArray<ReadonlyCubelet>) {
		this.#cubelets = cubelets;
		this.#predicates = [];
		this.#negateNext = false;
	}

	withPredicate(predicate: (cubelet: ReadonlyCubelet) => boolean) {
		if (this.#negateNext) {
			predicate = cubelet => !predicate.call(this, cubelet);
			this.#negateNext = false;
		}
		this.#predicates.push(predicate);
		return this;
	}

	not(): CubeletInspector {
		this.#negateNext = true;
		return this;
	}

	withType(type: CubePartType): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.type.equals(type));
	}

	corners(): CubeletInspector {
		return this.withType(CubePartType.CORNER);
	}

	edges(): CubeletInspector {
		return this.withType(CubePartType.EDGE);
	}

	faces(): CubeletInspector {
		return this.withType(CubePartType.FACE);
	}

	inPart(part: CubePart): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.location.part.equals(part));
	}

	atOrigin(origin: Vector): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.location.origin.equals(origin));
	}

	atOriginComponent(dimension: Dimension, component: number): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.location.origin.componentEquals(dimension, component));
	}

	atX(x: number): CubeletInspector {
		return this.atOriginComponent(Dimension.X, x);
	}

	atY(y: number): CubeletInspector {
		return this.atOriginComponent(Dimension.Y, y);
	}

	atZ(z: number): CubeletInspector {
		return this.atOriginComponent(Dimension.Z, z);
	}

	along(dimension: Dimension): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.location.isAlong(dimension));
	}

	alongX(): CubeletInspector {
		return this.along(Dimension.X);
	}

	alongY(): CubeletInspector {
		return this.along(Dimension.Y);
	}

	alongZ(): CubeletInspector {
		return this.along(Dimension.Z);
	}

	initiallyInPart(part: CubePart): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.initialLocation.part.equals(part));
	}

	initiallyAtOrigin(origin: Vector): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.initialLocation.origin.equals(origin));
	}

	initiallyAtOriginComponent(dimension: Dimension, component: number): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.initialLocation.origin.componentEquals(dimension, component));
	}

	initiallyAtX(x: number): CubeletInspector {
		return this.initiallyAtOriginComponent(Dimension.X, x);
	}

	initiallyAtY(y: number): CubeletInspector {
		return this.initiallyAtOriginComponent(Dimension.Y, y);
	}

	initiallyAtZ(z: number): CubeletInspector {
		return this.initiallyAtOriginComponent(Dimension.Z, z);
	}

	initiallyAlong(dimension: Dimension): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.initialLocation.isAlong(dimension));
	}

	initiallyAlongX(): CubeletInspector {
		return this.initiallyAlong(Dimension.X);
	}

	initiallyAlongY(): CubeletInspector {
		return this.initiallyAlong(Dimension.Y);
	}

	initiallyAlongZ(): CubeletInspector {
		return this.initiallyAlong(Dimension.Z);
	}

	solved(): CubeletInspector {
		return this.withPredicate(cubelet => cubelet.isSolved());
	}

	//TODO: Something with orientation

	private checkTermination() {
		if (this.#negateNext) throw new Error('Cannot use not() before a terminator');
	}

	findAll(): ReadonlyArray<ReadonlyCubelet> {
		this.checkTermination();
		return this.#cubelets.filter((cubelet) => {
			for (let filter of this.#predicates) {
				if (!filter.call(undefined, cubelet)) return false;
			}
			return true;
		});
	}

	findFirst(): ReadonlyCubelet | undefined {
		this.checkTermination();
		const result = this.#cubelets.find((cubelet) => {
			for (let filter of this.#predicates) {
				if (!filter.call(undefined, cubelet)) return false;
			}
			return true;
		});
		if (result === undefined) return undefined;
		return result;
	}

	findOne(): ReadonlyCubelet {
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

	areSolved(): boolean {
		this.checkTermination();
		return this.findAll().every(cubelet => cubelet.isSolved());
	}

	areUnsolved(): boolean {
		this.checkTermination();
		return this.findAll().every(cubelet => !cubelet.isSolved());
	}

}