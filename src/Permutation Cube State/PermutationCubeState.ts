//import { CubePart } from "../Cube Geometry/CubePart";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubeSolutionCondition } from "../Cube/CubeSolutionCondition";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Printable } from "../Interface/Printable";
//import { Arrays } from "../Utilities/Arrays";
//import { CubeletState } from "../Cube State/CubeletState";
//import { Cubelet } from "../Cube/Cubelet";



export class PermutationCubeStateExport {
	constructor(readonly spec: string, readonly solv:string,
		readonly permutations: ReadonlyArray<ReadonlyArray<number>>,
		readonly reorientations: ReadonlyArray<ReadonlyArray<number>>) {
	}

}

/** The CubeState encodes the permutations and reorientations. 
 * 
 * They are encoded by indices (corresponding to locations on any cubePart) and reorientation numbers (how the normal vectors are shifted with respect to a fixed standard ordering) - the class provides static methods to convert these indices
 * 
 */
export class PermutationCubeState implements Exportable, Equalizable<PermutationCubeState>, Printable {

	constructor(readonly spec: CubeSpecification, readonly solv: CubeSolutionCondition,
		readonly permutations: ReadonlyArray<ReadonlyArray<number>>,
		readonly reorientations: ReadonlyArray<ReadonlyArray<number>>) {
		if (permutations.length!=3)	throw new Error('Wrong number of permutations');
		if (permutations[0].length!= CubePartType.getByIndex(0).countLocations(spec)
		|| permutations[1].length!= CubePartType.getByIndex(1).countLocations(spec)
		|| permutations[2].length!= CubePartType.getByIndex(2).countLocations(spec))
		throw new Error('Wrong length of permutations');
		if (reorientations.length!=3)	throw new Error('Wrong number of reorientations');
		if (reorientations[0].length!= CubePartType.getByIndex(0).countLocations(spec)
		|| reorientations[1].length!= CubePartType.getByIndex(1).countLocations(spec)
		|| reorientations[2].length!= CubePartType.getByIndex(2).countLocations(spec))
		throw new Error('Wrong length of reorientations');
		//TODO Validate that permutations are actually permutations (better when making contact with an existing permutation library)

	}

	static import(value: string): PermutationCubeState {
		const exportValue = JSON.parse(value) as PermutationCubeStateExport;
		return new PermutationCubeState(CubeSpecification.import(exportValue.spec),CubeSolutionCondition.import(exportValue.solv), exportValue.permutations, exportValue.reorientations);
	}

	export(): string {
		//return JSON.stringify(new SimonCubeStateExport(this.spec.export(), this.cubelets.map(c => c.export())));
		return "";
	}

	equals(other: PermutationCubeState): boolean {
		throw new Error('Errors in implementation, see code');
		/*return this.spec.equals(other.spec) 
		&& Arrays.equals(this.permutations[0], other.permutations[0])
		&& Arrays.equals(this.permutations[1], other.permutations[1])
		&& Arrays.equals(this.permutations[2], other.permutations[2])
		&& Arrays.equals(this.reorientations[0], other.reorientations[0])
		&& Arrays.equals(this.reorientations[1], other.reorientations[1])
		&& Arrays.equals(this.reorientations[2], other.reorientations[2]);
		*/
	}

	toString(): string {
		return 'Corner Permutations:   [' + this.permutations[0].toString() + "] \n" +
		'Edge   Permutations:   [' + this.permutations[1].toString() + "] \n" +
		'Face   Permutations:   [' + this.permutations[2].toString() + "] \n" +
		'Corner Reorientations: [' + this.reorientations[0].toString() + "] \n" +
		'Edge   Reorientations: [' + this.reorientations[1].toString() + "] \n" +
		'Face   Reorientations: [' + this.reorientations[2].toString() + "] \n";
	}

}