import { CubeSpecification } from '../src/Cube Geometry/CubeSpecification';
//import { CubePart } from '../src/Cube Geometry/CubePart';
import { CubeSolutionCondition, CubeSolutionConditionType } from '../src/Cube/CubeSolutionCondition';
import { Cube } from '../src/Cube/Cube';
//import { Cubelet } from '../src/Cube/Cubelet';
//import { Vector } from '../src/Linear Algebra/Vector';
//import { Dimension } from '../src/Linear Algebra/Dimension';
//import { Cubelet } from '../src/Cube/Cubelet';
//import { Matrix } from '../src/Linear Algebra/Matrix';
import { PermutationCubeStateTools } from '../src/Permutation Cube State/PermutationCubeStateTools';
import { PermutationCubeStateConverter } from '../src/Permutation Cube State/PermutationCubeStateConverter';



test('Test Converter', () => {

	const spec = new CubeSpecification(3);
	const solv= new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec,solv);
	const converter= new PermutationCubeStateConverter(); 

	//Is the empty cube correctly encoded into permutations?
	let permutationCubeState = converter.save(cube.getState());
	//console.log(permutationCubeState.toString());
	expect(permutationCubeState.permutations[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
	expect(permutationCubeState.permutations[1]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);  
	expect(permutationCubeState.permutations[2]).toEqual([0, 1, 2, 3, 4, 5]);
	expect(permutationCubeState.reorientations[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
	expect(permutationCubeState.reorientations[1]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	expect(permutationCubeState.reorientations[2]).toEqual([0, 0, 0, 0, 0, 0]);
	//and decoded back into a solved cube without errors?
	let cubeState2=converter.load(permutationCubeState);
	cube.setState(cubeState2);
	expect(cube.solv.isCubeSolved(cube));

	//Is after a rotation the cube correctly encoded into permutations?
	cube.mRight();
	let permutationCubeState2 = converter.save(cube.getState());
	//console.log(permutationCubeState2.toString());
	//TODO SL Adapt indices and match to scientific work which we take as standardizing
	expect(permutationCubeState2.permutations[0]).toEqual([2,0,3,1,4,5,6,7] );
	expect(permutationCubeState2.permutations[1]).toEqual([0,6,2,3,4,1,9,7,8,5,10,11]);  
	expect(permutationCubeState2.permutations[2]).toEqual([0,1,2,3,4,5]);
	expect(permutationCubeState2.reorientations[0]).toEqual([2,1,1,2,0,0,0,0]);
	expect(permutationCubeState2.reorientations[1]).toEqual([0,1,0,0,0,0,0,0,0,1,0,0]);
	expect(permutationCubeState2.reorientations[2]).toEqual([0,3,0,0,0,0]);	//and decoded back into a solved cube without errors?
	let cubeState3=converter.load(permutationCubeState2);
	cube.setState(cubeState3);
	cube.mRight(); 	cube.mRight(); 	cube.mRight();
	expect(cube.solv.isCubeSolved(cube));

});

test('Test Tools', () => {
	const spec = new CubeSpecification(3);
	const solv= new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec, solv);
	const converter= new PermutationCubeStateConverter(); 

	let permutationCubeState = converter.save(cube.getState());
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState, cubeSolutionCondition));
	expect(PermutationCubeStateTools.getOrbit(permutationCubeState).isSolvable());

	cube.mRight();
	let permutationCubeState2 = converter.save(cube.getState());
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState2, cubeSolutionCondition));
	expect(PermutationCubeStateTools.getOrbit(permutationCubeState2).isSolvable());

	let permutationCubeState3 = PermutationCubeStateTools.shuffleByExplosion(spec, solv);
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState3));
	expect(!PermutationCubeStateTools.getOrbit(permutationCubeState3).isSolvable());
});