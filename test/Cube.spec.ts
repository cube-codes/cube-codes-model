import { CubeSpecification } from '../src/Cube Geometry/CubeSpecification';
import { CubePart } from '../src/Cube Geometry/CubePart';
import { CubeletLocation } from '../src/Cube/CubeletLocation';
import { Cube } from '../src/Cube/Cube';
import { Vector } from '../src/Linear Algebra/Vector';
import { Dimension } from '../src/Linear Algebra/Dimension';
import { Cubelet } from '../src/Cube/Cubelet';
import { Matrix } from '../src/Linear Algebra/Matrix';
import { CubeSolutionCondition, CubeSolutionConditionType } from '../src/Cube/CubeSolutionCondition';
import { CubeMove } from '../src/Cube Move/CubeMove';
import { CubeFace } from '../src/Cube Geometry/CubeFace';
import { CubeMoveAngle } from '../src/Cube Move/CubeMoveAngle';

test('Simple Move', () => {

	const spec = new CubeSpecification(4);
	const solv = new CubeSolutionCondition(CubeSolutionConditionType.STRICT);
	const cube = new Cube(spec, solv);
	cube.move(new CubeMove(spec, CubeFace.FRONT, 1, 1, CubeMoveAngle.C90));
	expect(cube.getInspector().initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, -1.5, 1.5));
	expect(cube.getInspector().initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, -1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, 1.5, -1.5));

});

test('Solution Condition', () => {

	const spec = new CubeSpecification(4);
	const solv1 = new CubeSolutionCondition(CubeSolutionConditionType.STRICT);
	const solv2 = new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube1 = new Cube(spec, solv1);
	const cube2 = new Cube(spec, solv2);
	//Rotate complete cube
	cube1.move(new CubeMove(spec, CubeFace.FRONT, 1, 4, CubeMoveAngle.C90));
	cube2.move(new CubeMove(spec, CubeFace.FRONT, 1, 4, CubeMoveAngle.C90));
	expect(cube1.isSolved());
	expect(cube2.isSolved());
	//Rotate orientation of element at right face 
	cube1.getInspector().atOrigin(new Vector([1.5,0.5,0.5])).findOne().orientation.rotate(Dimension.X);
	cube2.getInspector().atOrigin(new Vector([1.5,0.5,0.5])).findOne().orientation.rotate(Dimension.X);
	expect(cube1.isSolved());
	expect(cube2.isSolved());
	expect(!cube1.isSolved());
	expect(cube2.isSolved());
	//TODO Switch two elements at right face....
});

test('Basic Test', () => {

	const spec = new CubeSpecification(4);
	const solv = new CubeSolutionCondition(CubeSolutionConditionType.STRICT);
	const uf2 = CubeletLocation.fromPartAndOriginComponentsInPartDimensions(spec, CubePart.UF, [0.5]);

	// Is the cubelet location origin correctly calculated
	expect(uf2.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));

	const uf2cubelet = new Cubelet(new Cube(spec, solv), uf2);

	// Is the origin still vailable in the cubelet?
	expect(uf2cubelet.initialLocation.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));
	expect(uf2cubelet.location.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));

	uf2cubelet.rotate(Dimension.Y);

	// Does it keep the initial location?
	expect(uf2cubelet.initialLocation.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));
	// Does it change the location correctly?
	expect(uf2cubelet.location.origin).toEqual(Vector.fromComponents(1.5, 1.5, -0.5));


	///////////////////////////
	//Reorientation

	//Is a BaseChange from given vectors identified correctly 
	const LDB_to_LFD = Matrix.forBaseChange([Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, 1, 0), Vector.fromComponents(0, 0, 1)], [Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, 0, -1), Vector.fromComponents(0, 1, 0)]);
	expect(LDB_to_LFD.toString()).toEqual('((1,0,0),(0,0,1),(0,-1,0))');
	//....Test Reorientaion

	///////////////////////////
	// Rotation Cube
	const cube = new Cube(spec, solv);
	cube.move(new CubeMove(spec, CubeFace.RIGHT, 1, 1, CubeMoveAngle.C90));
	//console.log(cube.toString());
	expect(cube.getInspector().initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, 1.5, -1.5));
	expect(cube.getInspector().initiallyAtOrigin(Vector.fromComponents(0.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));

});