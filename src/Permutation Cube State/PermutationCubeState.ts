import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Identifiable } from "../Interface/Identifiable";
import { Printable } from "../Interface/Printable";
import { Arrays } from "../Utilities/Arrays";
import { Permutations } from "../Utilities/Permutations";
import { Random } from "../Utilities/Random";
import { Color3Orbit } from "./Color3Orbit";

export class PermutationCubeStateExport {

	constructor(readonly permutations: ReadonlyArray<ReadonlyArray<number>>,
		readonly reorientations: ReadonlyArray<ReadonlyArray<number>>) {
	}

}

/**
 * The CubeState encodes the permutations and reorientations. 
 * 
 * They are encoded by indices (corresponding to locations on any cubePart) and reorientation numbers (how the normal vectors are shifted with respect to a fixed standard ordering) - the class provides static methods to convert these indices.
 */
export class PermutationCubeState implements Exportable<PermutationCubeStateExport>, Identifiable, Equalizable<PermutationCubeState>, Printable {

	constructor(spec: CubeSpecification, readonly permutations: ReadonlyArray<ReadonlyArray<number>>,
		readonly reorientations: ReadonlyArray<ReadonlyArray<number>>) {
		if (permutations.length != 3) throw new Error('Wrong number of permutations');
		if (permutations[0].length != CubePartType.getByIndex(0).countLocations(spec)
			|| permutations[1].length != CubePartType.getByIndex(1).countLocations(spec)
			|| permutations[2].length != CubePartType.getByIndex(2).countLocations(spec))
			throw new Error('Wrong length of permutations');
		if (reorientations.length != 3) throw new Error('Wrong number of reorientations');
		if (reorientations[0].length != CubePartType.getByIndex(0).countLocations(spec)
			|| reorientations[1].length != CubePartType.getByIndex(1).countLocations(spec)
			|| reorientations[2].length != CubePartType.getByIndex(2).countLocations(spec))
			throw new Error('Wrong length of reorientations');
		//TODO Validate that permutations are actually permutations (better when making contact with an existing permutation library)
	}

	static fromSolved(spec: CubeSpecification): PermutationCubeState {

		const permutations = new Array();
		const reorientations = new Array();

		for (const type of CubePartType.getAll()) {
			permutations[type.countDimensions()] = Arrays.integerRangeToExclusivly(type.countLocations(spec));
			reorientations[type.countDimensions()] = Arrays.repeat(type.countLocations(spec), 0);
		}

		return new PermutationCubeState(spec, permutations, reorientations);

	}

	static fromShuffleByExplosion(spec: CubeSpecification): PermutationCubeState {

		const permutations = [new Array(), new Array(), new Array()];
		const reorientations = [new Array(), new Array(), new Array()];

		for (const type of CubePartType.getAll()) {
			const n = type.countLocations(spec);
			//RandomPermutation of 1...n
			//Make a pool of all indices, choose a random one, then delete it from the pool etc
			const indexPool = Arrays.integerRangeToExclusivly(n);
			for (let initialindex = 0; initialindex < n; initialindex++) { //Until indexPool is empty
				let indexIndex = Random.randomIntegerToExclusivly(indexPool.length);
				permutations[type.countDimensions()][initialindex] = indexPool[indexIndex];
				indexPool.splice(indexIndex, 1);
				//Also random orientation
				reorientations[type.countDimensions()][initialindex] = Random.randomIntegerToExclusivly(type.countNormalVectors());
			}

		}

		return new PermutationCubeState(spec, permutations, reorientations);

	}

	static import(spec: CubeSpecification, value: PermutationCubeStateExport): PermutationCubeState {
		return new PermutationCubeState(spec, value.permutations, value.reorientations);
	}

	export(): PermutationCubeStateExport {
		return new PermutationCubeStateExport(this.permutations, this.reorientations);
	}

	id(): string {
		return JSON.stringify(this.export());
	}

	equals(other: PermutationCubeState): boolean {
		return Arrays.identifies(this.permutations[0], other.permutations[0])
			&& Arrays.identifies(this.permutations[1], other.permutations[1])
			&& Arrays.identifies(this.permutations[2], other.permutations[2])
			&& Arrays.identifies(this.reorientations[0], other.reorientations[0])
			&& Arrays.identifies(this.reorientations[1], other.reorientations[1])
			&& Arrays.identifies(this.reorientations[2], other.reorientations[2]);
	}

	toString(): string {
		return '' +
			`Corner Permutations:   [${this.permutations[0]}]\n` +
			`Edge   Permutations:   [${this.permutations[1]}]\n` +
			`Face   Permutations:   [${this.permutations[2]}]\n` +
			`Corner Reorientations: [${this.reorientations[0]}]\n` +
			`Edge   Reorientations: [${this.reorientations[1]}]\n` +
			`Face   Reorientations: [${this.reorientations[2]}]\n`;
	}

	getColor3Orbit(spec: CubeSpecification): Color3Orbit {

		if (spec.edgeLength != 3) throw new Error('Orbit problem only solved and implemented for cube of length === 3');

		//Careful, since the cube can be rotated in space, the face permutations also have to be encountered, in contrast to literature
		const cornerPermutationsVsEdgePermutationsSignum = Permutations.getSignum(this.permutations[0]) * Permutations.getSignum(this.permutations[1]) * Permutations.getSignum(this.permutations[2]);

		let cornerReorientationsSum = 0;
		for (let index = 0; index < CubePartType.CORNER.countLocations(spec); index++) {
			cornerReorientationsSum += this.reorientations[0][index];
		}

		let edgeReorientationsSum = 0;
		for (let index = 0; index < CubePartType.EDGE.countLocations(spec); index++) {
			edgeReorientationsSum += this.reorientations[1][index];
		}
		
		return new Color3Orbit(cornerPermutationsVsEdgePermutationsSignum, cornerReorientationsSum % 3, edgeReorientationsSum % 2);
	
	}

}