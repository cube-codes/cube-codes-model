import { CubePartType } from "../../../src/Cube Geometry/CubePartType";
import { PermutationCubeState } from "./PermutationCubeState";
import { CubeSolutionCondition, CubeSolutionConditionType } from "../../../src/Cube/CubeSolutionCondition"
import { CubeSpecification } from "../../../src/Cube Geometry/CubeSpecification";
import { Random } from '../../../src/Utilities/Random';
import { Printable } from "../../../src/Interface/Printable";


export class PermutationCubeStateTools {

	static  shuffleByExplosion(spec:CubeSpecification, solv:CubeSolutionCondition): PermutationCubeState {

		const permutations = [new Array<number>(), new Array<number>(), new Array<number>()];
		const orientations = [new Array<number>(), new Array<number>(), new Array<number>()];

		for (const type of CubePartType.getAll()) {
			const n = type.countLocations(spec);
			//RandomPermutation of 1...n
			//Make a pool of all indices, choose a random one, then delete it from the pool etc
			const indexPool = Array<number>();
			for (let index = 0; index < n; index++) { indexPool.push(index); }
			for (let initialindex = 0; initialindex < n; initialindex++) { //Until indexPool is empty
				let indexindex = Random.randomIntegerFromToInclusivly(0, indexPool.length - 1);
				permutations[type.countDimensions()][initialindex] = indexPool[indexindex];
				indexPool.splice(indexindex, 1);
				//Also random orientation
				orientations[type.countDimensions()][initialindex] = Random.randomIntegerFromToInclusivly(0, type.countNormalVectors() - 1);
			}

		}
		return new PermutationCubeState(spec,solv, permutations, orientations);

	}

	static getOrbit(permutationCubeState:PermutationCubeState): Orbit3 {
		if (permutationCubeState.spec.edgeLength != 3) throw new Error('Orbit problem only solved and implemented for Cube of length 3');
		if (permutationCubeState.solv.type!=CubeSolutionConditionType.COLOR) throw new Error('Orbit problem only solved and implemented for SolutionCondition COLOR');

		//Careful, since the cube can be rotated in space, the face permutations also have to be encountered, in contrast to literature
		let CornerPermutationsVsEdgePermutationsSignum = PermutationCubeStateTools.getSignum(permutationCubeState.permutations[0]) * PermutationCubeStateTools.getSignum(permutationCubeState.permutations[1]) * PermutationCubeStateTools.getSignum(permutationCubeState.permutations[2]);

		let CornerReorientationsSum = 0;
		for (let index = 0; index < CubePartType.CORNER.countLocations(permutationCubeState.spec); index++) {
			CornerReorientationsSum += permutationCubeState.reorientations[0][index];
		}
		let EdgeReorientationsSum = 0;
		for (let index = 0; index < CubePartType.EDGE.countLocations(permutationCubeState.spec); index++) {
			EdgeReorientationsSum += permutationCubeState.reorientations[1][index];
		}
		return new Orbit3(CornerPermutationsVsEdgePermutationsSignum,CornerReorientationsSum % 3,EdgeReorientationsSum % 2);
	}

	/** Computes the signum of a permutation, used in getOrbit
	 * 
	 */
	private static getSignum(permutation: ReadonlyArray<number>): number {
		let signumCount = 0;
		for (let i: number = 0; i < permutation.length; i++) {
			for (let j: number = i + 1; j < permutation.length; j++) {
				if (permutation[i] > permutation[j]) signumCount++;
			}
		}
		//console.log(permutation);
		//console.log("SignumCount:"+signumCount);
		return Math.pow(-1, signumCount);
	}	
}

export class Orbit3 implements Printable{
	constructor(
		readonly CornerPermutationsVsEdgePermutationsSignum:number, // +1 or -1
		readonly CornerOrientationSumMod3: number, //0,1,2
		readonly EdgeOrientationsSumMod2: number)  //0,1
		{
			if (CornerPermutationsVsEdgePermutationsSignum != +1 && CornerPermutationsVsEdgePermutationsSignum != -1) throw Error('Illegal value for signum');
			if (CornerOrientationSumMod3 != 0 && CornerOrientationSumMod3 != 1 && CornerOrientationSumMod3 !=2) throw Error('Illegal value for corner orientation');
			if (EdgeOrientationsSumMod2 != 0 && EdgeOrientationsSumMod2 != 1) throw Error('Illegal value for edge orientation');
	}
	public toString():string {
		return "Orbit: Signums=" + this.CornerPermutationsVsEdgePermutationsSignum.toString()
		+ ", CornerOrientations=" + this.CornerOrientationSumMod3.toString()
		+ ", EdgeOrientations=" + this.EdgeOrientationsSumMod2.toString();
	}
	public isSolvable() : boolean {
		return (this.CornerPermutationsVsEdgePermutationsSignum==1)&&(this.CornerOrientationSumMod3==0)&&(this.EdgeOrientationsSumMod2==0);
	}
}