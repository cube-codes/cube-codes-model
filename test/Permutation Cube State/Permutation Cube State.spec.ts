import { CubeSpecification } from '../../src/Cube Geometry/CubeSpecification';
import { CubeSolutionCondition, CubeSolutionConditionType } from '../../src/Cube/CubeSolutionCondition';
import { Cube } from '../../src/Cube/Cube';
import { PermutationCubeStateConverter } from '../../src/Permutation Cube State/PermutationCubeStateConverter';
import { CubeApi } from '../CubeApi';
import { PermutationCubeState } from '../../src/Permutation Cube State/PermutationCubeState';

test('Test Converter', () => {

	const spec = new CubeSpecification(3);
	const solv = new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec, solv);
	const cubeApi = new CubeApi(cube);
	const converter = new PermutationCubeStateConverter(spec);

	//Is the empty cube correctly encoded into permutations?
	let permutationCubeState = converter.fromCubeState(cube.getState());
	//console.log(permutationCubeState.toString());
	expect(permutationCubeState.permutations[0]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
	expect(permutationCubeState.permutations[1]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
	expect(permutationCubeState.permutations[2]).toEqual([0, 1, 2, 3, 4, 5]);
	expect(permutationCubeState.reorientations[0]).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
	expect(permutationCubeState.reorientations[1]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	expect(permutationCubeState.reorientations[2]).toEqual([0, 0, 0, 0, 0, 0]);
	//and decoded back into a solved cube without errors?
	let cubeState2 = converter.toCubeState(permutationCubeState);
	cube.setState(cubeState2);
	expect(cube.isSolved());

	//Is after a rotation the cube correctly encoded into permutations?
	cubeApi.right();
	let permutationCubeState2 = converter.fromCubeState(cube.getState());
	//console.log(permutationCubeState2.toString());
	//TODO SL Adapt indices and match to scientific work which we take as standardizing
	expect(permutationCubeState2.permutations[0]).toEqual([2, 0, 3, 1, 4, 5, 6, 7]);
	expect(permutationCubeState2.permutations[1]).toEqual([0, 6, 2, 3, 4, 1, 9, 7, 8, 5, 10, 11]);
	expect(permutationCubeState2.permutations[2]).toEqual([0, 1, 2, 3, 4, 5]);
	expect(permutationCubeState2.reorientations[0]).toEqual([2, 1, 1, 2, 0, 0, 0, 0]);
	expect(permutationCubeState2.reorientations[1]).toEqual([0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]);
	expect(permutationCubeState2.reorientations[2]).toEqual([0, 3, 0, 0, 0, 0]);	//and decoded back into a solved cube without errors?
	let cubeState3 = converter.toCubeState(permutationCubeState2);
	cube.setState(cubeState3);
	cubeApi.right(1, 3);
	expect(cube.isSolved());

});

test('Test Tools', () => {
	const spec = new CubeSpecification(3);
	const solv = new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec, solv);
	const cubeApi = new CubeApi(cube);
	const converter = new PermutationCubeStateConverter(spec);

	let permutationCubeState = converter.fromCubeState(cube.getState());
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState, cubeSolutionCondition));
	expect(permutationCubeState.getColor3Orbit(spec).isSolvable());

	cubeApi.right();
	let permutationCubeState2 = converter.fromCubeState(cube.getState());
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState2, cubeSolutionCondition));
	expect(permutationCubeState2.getColor3Orbit(spec).isSolvable());

	let permutationCubeState3 = PermutationCubeState.fromShuffleByExplosion(spec);
	//console.log(PermutationCubeStateTools.getOrbit(permutationCubeState3));
	expect(!permutationCubeState3.getColor3Orbit(spec).isSolvable());
});