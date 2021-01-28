import { Dimension } from "../../src/Linear Algebra/Dimension";
import { Matrix } from "../../src/Linear Algebra/Matrix";
import { Vector } from "../../src/Linear Algebra/Vector";

test('Simple Calculations', () => {

	const m1 = new Matrix([[1, 2, 3], [4, 2, -3], [0, 2, 0]]);
	const m2 = new Matrix([[4, 1.5, 0], [4, -1, 0], [0, 0.5, 0]]);
	const v1 = new Vector([1, 4, 3]);

	//Fields
	expect(m1.components[1][0]).toEqual(4);

	// Constructors
	expect(() => new Matrix([[1, 2], [4, 5]])).toThrowError();
	expect(Matrix.fromSameComponents(1)).toEqual(new Matrix([[1, 1, 1], [1, 1, 1], [1, 1, 1]]));
	expect(Matrix.fromComponent(Dimension.Y, Dimension.Z, 2)).toEqual(new Matrix([[0, 0, 0], [0, 0, 2], [0, 0, 0]]));

	// Import/Export/Equals/toString
	expect(Matrix.import(m1.export())).toEqual(m1);
	expect(m1.equals(new Matrix([[1, 2, 3], [4, 2, -3], [0, 2, 0]]))).toEqual(true);
	expect(m1.toString()).toEqual('((1,2,3),(4,2,-3),(0,2,0))');

	// Read full
	expect(() => m1.ensureInteger());
	expect(() => m2.ensureInteger()).toThrowError();

	// Read component
	expect(m1.getComponent(Dimension.Z, Dimension.Y)).toEqual(2);
	expect(m1.componentEquals(Dimension.Y, Dimension.X, 4)).toEqual(true);

	// Calculation
	expect(m1.withComponent(Dimension.Y, Dimension.Z, 7)).toEqual(new Matrix([[1, 2, 3], [4, 2, 7], [0, 2, 0]]));
	expect(m1.add(m2)).toEqual(new Matrix([[5, 3.5, 3], [8, 1, -3], [0, 2.5, 0]]));
	expect(m1.addAt(Dimension.X, Dimension.Z, 7)).toEqual(new Matrix([[1, 2, 10], [4, 2, -3], [0, 2, 0]]));
	expect(m1.subtract(m2)).toEqual(new Matrix([[-3, 0.5, 3], [0, 3, -3], [0, 1.5, 0]]));
	expect(m1.subtractAt(Dimension.Z, Dimension.Z, 7)).toEqual(new Matrix([[1, 2, 3], [4, 2, -3], [0, 2, -7]]));
	expect(m1.scalarMultiply(2)).toEqual(new Matrix([[2, 4, 6], [8, 4, -6], [0, 4, 0]]));
	expect(m1.scalarDivide(2)).toEqual(new Matrix([[0.5, 1, 1.5], [2, 1, -1.5], [0, 1, 0]]));
	expect(m1.multiply(m2)).toEqual(new Matrix([[10, 11, 7.5], [0, 6, 15], [2, 1, -1.5]]));
	expect(m1.vectorMultiply(v1)).toEqual(new Vector([17, 16, -9]));

});