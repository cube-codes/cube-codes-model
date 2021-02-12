import { CubeStateExporter } from "../../src/Cube State/CubeStateExporter";
import { CubeSpecification } from "../../src/Cube Geometry/CubeSpecification";
import { CubeState } from "../../src/Cube State/CubeState";

const spec8 = new CubeSpecification(8);
const cse8 = new CubeStateExporter(spec8);

test('Simple stringify and parse of solved cube', () => {

	const state = CubeState.fromSolved(spec8);
	const exportValue = cse8.stringify(state);
	expect(cse8.parse(exportValue)).toEqual(state);

});