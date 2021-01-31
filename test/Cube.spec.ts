import { CubeSpecification } from '../src/Cube Geometry/CubeSpecification';
import { CubePart } from '../src/Cube Geometry/CubePart';
import { CubeletLocation } from '../src/Cube/CubeletLocation';
import { Cube } from '../src/Cube/Cube';
import { Vector } from '../src/Linear Algebra/Vector';
import { Dimension } from '../src/Linear Algebra/Dimension';
import { Cubelet } from '../src/Cube/Cubelet';
import { Matrix } from '../src/Linear Algebra/Matrix';

test('Simple Move', () => {

	const spec = new CubeSpecification(4);
	const cube = new Cube(spec);
	cube.mFront();
	expect(cube.cubelets.initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, -1.5, 1.5));
	expect(cube.cubelets.initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, -1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, 1.5, -1.5));

});

test('Basic Test', () => {

	const spec = new CubeSpecification(4);
	const uf2 = CubeletLocation.fromPartAndOriginComponentsInPartDimensions(spec, CubePart.UF, [0.5]);

	// Is the cubelet location origin correctly calculated
	expect(uf2.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));

	const uf2cubelet = new Cubelet(new Cube(spec), uf2);

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

	//RotationAroundX
	const LDB_to_LFD = Matrix.forBaseChange(Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, 1, 0), Vector.fromComponents(0, 0, 1), Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, 0, -1), Vector.fromComponents(0, 1, 0));
	expect(LDB_to_LFD.toString()).toEqual('((1,0,0),(0,0,1),(0,-1,0))');
	const LFD_to_LUF = Matrix.forBaseChange(Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, 0, -1), Vector.fromComponents(0, 1, 0), Vector.fromComponents(1, 0, 0), Vector.fromComponents(0, -1, 0), Vector.fromComponents(0, 0, -1));
	expect(LFD_to_LUF.toString()).toEqual('((1,0,0),(0,0,1),(0,-1,0))');


	///////////////////////////
	// Rotation Cube
	const cube = new Cube(spec);
	cube.mRight();
	//console.log(cube.toString());
	expect(cube.cubelets.initiallyAtOrigin(Vector.fromComponents(1.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(1.5, 1.5, -1.5));
	expect(cube.cubelets.initiallyAtOrigin(Vector.fromComponents(0.5, 1.5, 1.5)).findOne().location.origin).toEqual(Vector.fromComponents(0.5, 1.5, 1.5));



});