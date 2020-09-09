import { CubeSpecification } from "./CubeGeometry";

//TODO: Hier soll eine andere Darstellung als Cubicals stehen ...

export class CubeState {

	constructor(readonly spec: CubeSpecification) {}


	/*

	public getCornerPermutation(): Array<number> {
		let result: Array<number> = new Array<number>();
		for (let index = 0; index < CornerCubicalLocation.getIndexBound(this.spec); index++) {
			result[this.cornerCubicals[index].initiallocation.index] = this.cornerCubicals[index].location.index
		}
		return result;
	}
	public getEdgePermutation(): Array<number> {
		let result: Array<number> = new Array<number>();
		for (let index = 0; index < EdgeCubicalLocation.getIndexBound(this.spec); index++) {
			result[this.edgeCubicals[index].initiallocation.index] = this.edgeCubicals[index].location.index
		}
		return result;
	}
	public getFacePermutation(): Array<number> {
		let result: Array<number> = new Array<number>();
		for (let index = 0; index < FaceCubicalLocation.getIndexBound(this.spec); index++) {
			result[this.faceCubicals[index].initiallocation.index] = this.faceCubicals[index].location.index
		}
		return result;
	}

	public toString(): string {
		return ColoredCube.fromCubeState(this).toString();
	}
	public toPermutationString(): string {
		return 'Corner Permutations: [' + this.getCornerPermutation().toString() + "] \n" +
			'Edge   Permutations: [' + this.getEdgePermutation().toString() + "] \n" +
			'Face   Permutations: [' + this.getFacePermutation().toString() + "] \n";
	}

	*/

}