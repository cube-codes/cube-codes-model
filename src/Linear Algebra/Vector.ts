import { add, multiply, deepEqual, subtract, divide, dot, cross, clone } from "mathjs";
import { Dimension } from "./Dimension";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
import { Matrix } from "./Matrix";

export class Vector implements Exportable, Equalizable<Vector>, Printable {

	static readonly ZERO = Vector.fromComponents(0, 0, 0)

	readonly components: Array<number>

	constructor(components: Array<number>) {
		if (components.length !== 3) throw new Error(`Invalid components length: ${components.length}`);
		this.components = clone(components);
	}

	static fromComponents(x: number, y: number, z: number): Vector {
		return new Vector([x, y, z]);
	}

	static fromSameComponents(allComponents: number): Vector {
		return new Vector([allComponents, allComponents, allComponents]);
	}

	static fromComponent(dimension: Dimension, component: number): Vector {
		return this.ZERO.withComponent(dimension, component);
	}

	static import(value: string): Vector {
		return new Vector(JSON.parse(value));
	}

	export(): string {
		return JSON.stringify(this.components);
	}

	equals(other: Vector): boolean {
		return deepEqual(this.components, other.components) as unknown as boolean;
	}

	toString(): string {
		return `(${this.components.toString()})`;
	}

	ensureInteger(): void {
		this.components.forEach((component, index) => { if (!Number.isInteger(component)) throw new Error(`Invalid component ${Dimension.getByIndex(index)}: ${component}`); });
	}

	getComponent(dimension: Dimension): number {
		return this.components[dimension.index];
	}

	getX(): number {
		return this.getComponent(Dimension.X);
	}

	getY(): number {
		return this.getComponent(Dimension.Y);
	}

	getZ(): number {
		return this.getComponent(Dimension.Z);
	}

	componentEquals(dimension: Dimension, otherComponent: number): boolean {
		return this.getComponent(dimension) === otherComponent;
	}

	withComponent(dimension: Dimension, newComponent: number): Vector {
		const newComponents = clone(this.components);
		newComponents[dimension.index] = newComponent;
		return new Vector(newComponents);
	}

	add(summand2: Vector): Vector {
		return new Vector(add(this.components, summand2.components) as number[]);
	}

	addAt(dimension: Dimension, summand2: number): Vector {
		return this.add(Vector.fromComponent(dimension, summand2));
	}

	subtract(subtrahend: Vector): Vector {
		return new Vector(subtract(this.components, subtrahend.components) as number[]);
	}

	subtractAt(dimension: Dimension, subtrahend: number): Vector {
		return this.subtract(Vector.fromComponent(dimension, subtrahend));
	}

	scalarMultiply(factor2: number): Vector {
		return new Vector(multiply(this.components, factor2));
	}

	scalarDivide(divisor: number): Vector {
		return new Vector(divide(this.components, divisor) as number[]);
	}

	dotProduct(factor2: Vector): number {
		return dot(this.components, factor2.components);
	}

	crossProduct(factor2: Vector): Vector {
		return new Vector(cross(this.components, factor2.components) as number[]);
	}

	rotate(axis: Dimension): Vector {
		return Matrix.fromRotation(axis).vectorMultiply(this);
	}

}