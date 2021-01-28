import { add, multiply, deepEqual, subtract, divide, clone } from "mathjs";
import { Dimension } from "./Dimension";
import { Equalizable } from "../Interfaces/Equalizable";
import { Exportable } from "../Interfaces/Exportable";
import { Printable } from "../Interfaces/Printable";
import { Vector } from "./Vector";

export class Matrix implements Exportable, Equalizable<Matrix>, Printable {

	static readonly ZERO = new Matrix([[0, 0, 0], [0, 0, 0], [0, 0, 0]])
	static readonly IDENTITY = new Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])

	/**
	 * Outer array is a list of columns, inner arrays are the rows/entries of each column
	 */
	readonly components: Array<Array<number>>

	constructor(components: Array<Array<number>>) {
		if (components.length !== 3) throw new Error(`Invalid column length: ${components.length}`);
		components.forEach((componentColumn, columnIndex) => { if (componentColumn.length !== 3) throw new Error(`Invalid row length at column ${Dimension.getByIndex(columnIndex)}: ${componentColumn.length}`); });
		this.components = [...components];
	}

	static fromRotation(axis: Dimension): Matrix {
		switch (axis) {
			case Dimension.X: return new Matrix([[1, 0, 0], [0, 0, 1], [0, -1, 0]]);
			case Dimension.Y: return new Matrix([[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
			case Dimension.Z: return new Matrix([[0, 1, 0], [-1, 0, 0], [0, 0, 1]]);
			default: throw new Error(`Invalid axis: ${axis}`);
		}
	}

	static fromSameComponents(allComponents: number): Matrix {
		return new Matrix([[allComponents, allComponents, allComponents], [allComponents, allComponents, allComponents], [allComponents, allComponents, allComponents]]);
	}

	static fromComponent(columnDimension: Dimension, rowDimension: Dimension, component: number): Matrix {
		return this.ZERO.withComponent(columnDimension, rowDimension, component);
	}

	static import(value: string): Matrix {
		return new Matrix(JSON.parse(value));
	}

	export(): string {
		return JSON.stringify(this.components);
	}

	equals(other: Matrix): boolean {
		return deepEqual(this.components, other.components) as unknown as boolean;
	}

	toString(): string {
		return `((${this.components[0].toString()}),(${this.components[1].toString()}),(${this.components[2].toString()}))`;
	}

	ensureInteger(): void {
		this.components.forEach((componentColumn, columnIndex) => { this.components[columnIndex].forEach((component, rowIndex) => { if (!Number.isInteger(component)) throw new Error(`Invalid component at column ${Dimension.getByIndex(columnIndex)} at row ${Dimension.getByIndex(rowIndex)}: ${component}`); }); });
	}

	getComponent(columnDimension: Dimension, rowDimension: Dimension): number {
		return this.components[columnDimension.index][rowDimension.index];
	}

	componentEquals(columnDimension: Dimension, rowDimension: Dimension, otherComponent: number): boolean {
		return this.getComponent(columnDimension, rowDimension) === otherComponent;
	}

	withComponent(columnDimension: Dimension, rowDimension: Dimension, newComponent: number): Matrix {
		const newComponents = clone(this.components);
		newComponents[columnDimension.index][rowDimension.index] = newComponent;
		return new Matrix(newComponents);
	}

	add(summand2: Matrix): Matrix {
		return new Matrix(add(this.components, summand2.components) as number[][]);
	}

	addAt(columnDimension: Dimension, rowDimension: Dimension, summand2: number): Matrix {
		return this.add(Matrix.fromComponent(columnDimension, rowDimension, summand2));
	}

	subtract(subtrahend: Matrix): Matrix {
		return new Matrix(subtract(this.components, subtrahend.components) as number[][]);
	}

	subtractAt(columnDimension: Dimension, rowDimension: Dimension, subtrahend: number): Matrix {
		return this.subtract(Matrix.fromComponent(columnDimension, rowDimension, subtrahend));
	}

	scalarMultiply(factor2: number): Matrix {
		return new Matrix(multiply(this.components, factor2));
	}

	scalarDivide(divisor: number): Matrix {
		return new Matrix(divide(this.components, divisor) as number[][]);
	}

	multiply(factor2: Matrix): Matrix {
		// MathJS's "multiply" takes the factors swapped!
		return new Matrix(multiply(factor2.components, this.components));
	}

	vectorMultiply(factor2: Vector): Vector {
		// MathJS's "multiply" takes the factors swapped!
		return new Vector(multiply(factor2.components, this.components));
	}

}