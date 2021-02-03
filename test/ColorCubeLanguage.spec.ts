import { CubeSpecification } from '../src/Cube Geometry/CubeSpecification';
//import { CubePart } from '../src/Cube Geometry/CubePart';
import { CubeSolutionCondition, CubeSolutionConditionType } from '../src/Cube/CubeSolutionCondition';
import { Cube } from '../src/Cube/Cube';
//import { Cubelet } from '../src/Cube/Cubelet';
//import { Vector } from '../src/Linear Algebra/Vector';
//import { Dimension } from '../src/Linear Algebra/Dimension';
//import { Cubelet } from '../src/Cube/Cubelet';
//import { Matrix } from '../src/Linear Algebra/Matrix';
import { ColorCubeLanguage } from '../src/Cube State/ColorCubeLanguage';



test('Test Converter', () => {
	const spec = new CubeSpecification(3);
	const solv= new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec,solv);

	let colorCubeLanguage = new ColorCubeLanguage(spec);

	//How does the solved cube look? 
	//let colorCube1=colorCubeLanguage.stringify(cube.getState());
	//console.log(colorCube1);

	//How does the solved cube look? 
	cube.mRight();
	let colorCube2=colorCubeLanguage.stringify(cube.getState());
	//console.log(colorCube2);

	//Can I parse it back to the cube?
	const cube2 = new Cube(spec,solv);
	cube2.setState(colorCubeLanguage.parse(colorCube2));
	cube2.mRight();	cube2.mRight();	cube2.mRight();
	expect(cube2.isSolved());
});