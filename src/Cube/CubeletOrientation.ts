import { Equalizable } from "../Interface/Equalizable";
import { Printable } from "../Interface/Printable";
import { Dimension } from "../Linear Algebra/Dimension";
import { Matrix } from "../Linear Algebra/Matrix";

/**
 * Wraps an orthogonal matrix that describes how the cubical is currently rotated around its center, in comparison to its standard location and orientation.
 */
export class CubeletOrientation implements Equalizable<CubeletOrientation>, Printable {

	/** 
	 * The standard orientation
	 */
	static readonly IDENTITY: CubeletOrientation = new CubeletOrientation(Matrix.IDENTITY);


	constructor(readonly matrix: Matrix) {}

	equals(other: CubeletOrientation): boolean {
		return this.matrix.equals(other.matrix);
	}

	toString() {
		return this.matrix.toString();
	}

	/**
	 * Multiplies the current orientation this.matrix with a 90° rotation around the axis "dimension".
	 * @param dimension 
	 */
	rotate(axis: Dimension): CubeletOrientation {
		return new CubeletOrientation(this.matrix.rotate(axis));
	}

		//ToDo provide some access via systematic names
		static ALL(): Array<Matrix> {
			let result=new Array<Matrix>();
			//Identity
			result.push(new Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]]));
			//3 nontrivial Rotations around X, Y, Z axis (resp: permutation matrices 2-cycle, fixpioint +1 and permutation matrices identity)
			result.push(new Matrix([[+1, 0, 0], [0, 0, -1], [0, +1, 0]])); //=Matrix.fromRotation(X)
			result.push(new Matrix([[+1, 0, 0], [0, -1, 0], [0, 0, -1]]));
			result.push(new Matrix([[+1, 0, 0], [0, 0, 1], [0, 0, -1]]));
			result.push(new Matrix([[0, 0, +1], [0, +1, 0], [-1, 0, 0]])); //=Matrix.fromRotation(Y)
			result.push(new Matrix([[-1, 0, 0], [0, +1, 0], [0, 0, -1]]));
			result.push(new Matrix([[0, 0, -1], [0, +1, 0], [+1, 0, 0]]));
			result.push(new Matrix([[0, -1, 0], [+1, 0, 0], [0, 0, +1]])); //=Matrix.fromRotation(Z)
			result.push(new Matrix([[-1, 0, 0], [0, -1, 0], [0, 0, +1]])); 
			result.push(new Matrix([[0, +1, 0], [-1, 0, 0], [0, 0, +1]]));
			//2 nontrivial rotations around each diagonal (resp: permutation matrices 3-cycle )
			result.push(new Matrix([[0, 0, +1], [+1, 0, 0], [0, +1, 0]])); //X->Y->Z, fixes(1,1,1)
			result.push(new Matrix([[0, +1, 0], [0, 0, +1], [+1, 0, 0]])); //X<-Y<-Z, fixes(1,1,1)
			result.push(new Matrix([[0, 0, -1], [-1, 0, 0], [0, 1, 0]])); //fixes (-1,1,1)
			result.push(new Matrix([[0, -1, 0], [0, 0, +1], [-1, 0, 0]])); //fixes(-1,1,1)
			result.push(new Matrix([[0, 0, +1], [-1, 0, 0], [0, -1, 0]])); //fixes (1,-1,1)
			result.push(new Matrix([[0, -1, 0], [0, 0, -1], [+1, 0, 0]])); //fixes(1,-1,1)
			result.push(new Matrix([[0, 0, -1], [+1, 0, 0], [0, -1, 0]])); //fixes (1,1,-1)
			result.push(new Matrix([[0, +1, 0], [0, 0, -1], [-1, 0, 0]])); //fixes(1,1,-1)
			//6 point symmetries on axis between antipodal pairs of edges 
			result.push(new Matrix([[-1, 0, 0], [0, 0, +1], [0, +1, 0]])); 
			result.push(new Matrix([[-1, 0, 0], [0, 0, -1], [0, 0, -1]]));
			result.push(new Matrix([[0, 0, +1], [0, -1, 0], [+1, 0, 0]])); 
			result.push(new Matrix([[0, 0, -1], [0, -1, 0], [-1, 0, 0]]));
			result.push(new Matrix([[0, +1, 0], [+1, 0, 0], [0, 0, +1]])); 
			result.push(new Matrix([[0, -1, 0], [-1, 0, 0], [0, 0, +1]]));
			return result;
		}

}