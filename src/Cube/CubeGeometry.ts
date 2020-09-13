import { Matrix, matrix, multiply } from "mathjs";
import { Matrices } from "../Utilities/Matrices";

export class CubeSpecification {

	constructor(
		readonly edgeLength: number,
		readonly coloredFaces: boolean) {
		if (!Number.isInteger(edgeLength) || edgeLength < 2 || edgeLength > 8) throw new Error(`Invalid edge length: ${edgeLength}`);
	}

	static rubik() {
		return new CubeSpecification(3, true);
	}

	static rubikRevenge() {
		return new CubeSpecification(4, true);
	}

	toString(): string {
		return JSON.stringify(this);
	}

}

export class CubeDimension {

	static readonly X = new CubeDimension(0, 'X')
	static readonly Y = new CubeDimension(1, 'Y')
	static readonly Z = new CubeDimension(2, 'Z')
	static readonly ALL: ReadonlyArray<CubeDimension> = [CubeDimension.X,CubeDimension.Y,CubeDimension.Z];

	private constructor(readonly index: number, readonly name: string) {}
	
	static fromIndex(index: number): CubeDimension {
		switch (index) {
			case 0: return CubeDimension.X;
			case 1: return CubeDimension.Y;
			case 2: return CubeDimension.Z;
			default: throw new Error(`Invalid index: ${index}`);
		}
	}

	/*getOrthogonal(dimension2: CubeDimension): CubeDimension {
		return CubeDimension.fromIndex(3 - this.index - dimension2.index);
	}*/

	toString(): string {
		return this.name;
	}

}

export class CubeCoordinates {

	static readonly ZERO = new CubeCoordinates(0, 0, 0)

	static readonly E_X = new CubeCoordinates(1, 0, 0)
	static readonly E_Y = new CubeCoordinates(0, 1, 0)
	static readonly E_Z = new CubeCoordinates(0, 0, 1)

	static readonly E_XY = new CubeCoordinates(1, 1, 0)
	static readonly E_YZ = new CubeCoordinates(0, 1, 1)
	static readonly E_XZ = new CubeCoordinates(1, 0, 1)
	
	static readonly E_XYZ = new CubeCoordinates(1, 1, 1)

	constructor(readonly x: number,
		readonly y: number,
		readonly z: number) {
		/* SL: In transformations around center is necessary to have intermediate non-integral coordinates.
		if (!Number.isInteger(x)) throw new Error(`Invalid x: ${x}`);
		if (!Number.isInteger(y)) throw new Error(`Invalid y: ${y}`);
		if (!Number.isInteger(z)) throw new Error(`Invalid z: ${z}`);*/
	}

	static fromDimension(dimension: CubeDimension, value: number): CubeCoordinates {
		switch (dimension) {
			case CubeDimension.X: return new CubeCoordinates(value, 0, 0);
			case CubeDimension.Y: return new CubeCoordinates(0, value, 0);
			case CubeDimension.Z: return new CubeCoordinates(0, 0, value);
			default: throw new Error(`Invalid dimension: ${dimension}`);
		}
	}

	toString(): string {
		return `(${this.x},${this.y},${this.z})`;
	}

	getComponent(dimension: CubeDimension): number {
		switch (dimension) {
			case CubeDimension.X:
				return this.x;
			case CubeDimension.Y:
				return this.y;
			case CubeDimension.Z:
				return this.z;
			default:
				throw new Error(`Invalid dimension: ${dimension}`);
		}
	}

	matches(dimension: CubeDimension, value: number): boolean {
		return this.getComponent(dimension) === value;
	}

	withValue(dimension: CubeDimension, value: number): CubeCoordinates {
		switch (dimension) {
			case CubeDimension.X:
				return new CubeCoordinates(value, this.y, this.z);
			case CubeDimension.Y:
				return new CubeCoordinates(this.x, value, this.z);
			case CubeDimension.Z:
				return new CubeCoordinates(this.x, this.y, value);
			default:
				throw new Error(`Invalid dimension: ${dimension}`);
		}
	}

	add(summand2: CubeCoordinates | number): CubeCoordinates {
		if (summand2 instanceof CubeCoordinates) {
			return new CubeCoordinates(this.x + summand2.x, this.y + summand2.y, this.z + summand2.z);
		} else {
			return new CubeCoordinates(this.x + summand2, this.y + summand2, this.z + summand2);
		}
	}

	addAt(dimension: CubeDimension, summand2: number): CubeCoordinates {
		return this.withValue(dimension, this.getComponent(dimension) + summand2);
	}

	substract(subtrahend: CubeCoordinates | number): CubeCoordinates {
		if (subtrahend instanceof CubeCoordinates) {
			return new CubeCoordinates(this.x - subtrahend.x, this.y - subtrahend.y, this.z - subtrahend.z);
		} else {
			return new CubeCoordinates(this.x - subtrahend, this.y - subtrahend, this.z - subtrahend);
		}
	}

	substractAt(dimension: CubeDimension, subtrahend: number): CubeCoordinates {
		return this.withValue(dimension, this.getComponent(dimension) - subtrahend);
	}

	multiply(factor2: number): CubeCoordinates {
		return new CubeCoordinates(this.x * factor2, this.y * factor2, this.z * factor2);
	}

	multiplyAt(dimension: CubeDimension, factor2: number): CubeCoordinates {
		return this.withValue(dimension, this.getComponent(dimension) * factor2);
	}

	divide(divisor: number): CubeCoordinates {
		return new CubeCoordinates(this.x / divisor, this.y / divisor, this.z / divisor);
	}

	divideAt(dimension: CubeDimension, divisor: number): CubeCoordinates {
		return this.withValue(dimension, this.getComponent(dimension) / divisor);
	}

	scalarProduct(factor2: CubeCoordinates): CubeCoordinates {
		return new CubeCoordinates(this.x * factor2.x, this.y * factor2.y, this.z * factor2.z);
	}

	crossProduct(factor2: CubeCoordinates): CubeCoordinates {
		return new CubeCoordinates(this.y * factor2.z - this.z * factor2.y, this.z * factor2.x - this.x * factor2.z, this.x * factor2.y - this.y * factor2.x);
	}

	/**
	 * Applies a matrix to the coordinates. Used to rotate the cubical normal vectors around themselves
	 * @param transformation A matrix, typically orthogonal.
	 */
	transformAroundZero(transformation: Matrix): CubeCoordinates {
		const thisVector: Matrix = matrix([[this.x], [this.y], [this.z]]);
		const transformedVector: Matrix = multiply(transformation, thisVector);
		return new CubeCoordinates(transformedVector.get([0, 0]), transformedVector.get([1, 0]), transformedVector.get([2, 0]))
	}

	/**
	 * Applies a matrix to the coordinates, relative to the center of the cube. Used to rotate the cubical locations.
	 * @param transformation A matrix, typically orthogonal.
	 */
	transformAroundCenter(spec: CubeSpecification, transformation: Matrix): CubeCoordinates {
		const shift: number = (spec.edgeLength - 1) / 2;
		return this.substract(shift).transformAroundZero(transformation).add(shift);
	}

	rotate(spec: CubeSpecification, dimension: CubeDimension): CubeCoordinates {
		return this.transformAroundCenter(spec, Matrices.getAxisRotation(dimension));
	}

}