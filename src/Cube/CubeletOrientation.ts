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

}