import { Matrix, matrix, multiply, inv } from "mathjs";
import { CubeDimension, CubeCoordinates } from "../Cube/CubeGeometry";

export abstract class Matrices {

	static readonly IDENTITY: Matrix = matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])

	static rotateMatrix(matrix: Matrix, dimension: CubeDimension): Matrix {
		return multiply(Matrices.getAxisRotation(dimension), matrix);
	}

	static getAxisRotation(dimension: CubeDimension): Matrix {
		switch (dimension) {
			case CubeDimension.X: return matrix([[1, 0, 0], [0, 0, 1], [0, -1, 0]]);
			case CubeDimension.Y: return matrix([[0, 0, -1], [0, 1, 0], [1, 0, 0]]);
			case CubeDimension.Z: return matrix([[0, 1, 0], [-1, 0, 0], [0, 0, 1]]);
			default: throw new Error(`Invalid dimension: ${dimension}`);
		}
	}

	static getFromColumns(col1: CubeCoordinates, col2: CubeCoordinates, col3: CubeCoordinates): Matrix {
		return matrix([[col1.x, col2.x, col3.x], [col1.y, col2.y, col3.y], [col1.z, col2.z, col3.z]]);
	}

	static getTransitivityMatrix(from1: CubeCoordinates, from2: CubeCoordinates, from3: CubeCoordinates, to1: CubeCoordinates, to2: CubeCoordinates, to3: CubeCoordinates): Matrix {
		return multiply(Matrices.getFromColumns(to1, to2, to3), inv(Matrices.getFromColumns(from1, from2, from3)));
	}

	static getTransitivityOrthogonalMatrix(from1: CubeCoordinates, from2: CubeCoordinates, to1: CubeCoordinates, to2: CubeCoordinates): Matrix {
		const from3: CubeCoordinates = from1.crossProduct(from2);
		const to3: CubeCoordinates = to1.crossProduct(to2);
		return Matrices.getTransitivityMatrix(from1, from2, from3, to1, to2, to3);
	}

	static guessLinearlyIndependentAxisDirectionToAxisDirection(value: CubeCoordinates): CubeCoordinates {
		if (value.x == 0) return CubeCoordinates.E_X;
		if (value.y == 0) return CubeCoordinates.E_Y;
		if (value.z == 0) return CubeCoordinates.E_Z;
		throw new Error(`No axis direction: ${value.toString()}`);
	}

	static getTransitivityGuessedOrthogonalMatrix(from1: CubeCoordinates, to1: CubeCoordinates): Matrix {
		const from2 = Matrices.guessLinearlyIndependentAxisDirectionToAxisDirection(from1);
		const to2 = Matrices.guessLinearlyIndependentAxisDirectionToAxisDirection(to1);
		return Matrices.getTransitivityOrthogonalMatrix(from1, from2, to1, to2);
	}

	static getInverse(m:Matrix):Matrix {
		return inv(m);
	}

}