import { Cube, CubeSpecification, EdgeCubicle, CubeCoordinates } from "../src/Cube"

test('Basic Test', () => {

	let spec = new CubeSpecification(4);

	let d1 = new EdgeCubicle(spec, 0 * (4 - 2) + 1);
	expect(d1.coordinates).toEqual(new CubeCoordinates(2,4-1,0));

	let d2 = new EdgeCubicle(spec, 3 * (4 - 2) + 0);
	expect(d2.coordinates).toEqual(new CubeCoordinates(0,4-1,1));

	let c1 = new CubeCoordinates(2, 0, 4 - 1);
	expect(EdgeCubicle.fromCoordinates(spec, c1).index).toEqual(10 * (4-2) + 1);

});