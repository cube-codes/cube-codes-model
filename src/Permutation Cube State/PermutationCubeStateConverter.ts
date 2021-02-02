import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubePart } from "../Cube Geometry/CubePart";
import { CubeState } from "../Cube State/CubeState";
import { CubePartType } from "../Cube Geometry/CubePartType";
import { CubeletLocation } from "../Cube/CubeletLocation";
import { CubeletState } from "../Cube State/CubeletState";

//import { ReadonlyCubelet } from "../Cube/ReadonlyCubelet";
import { CubeletOrientation } from "../Cube/CubeletOrientation";
import { Vector } from "../Linear Algebra/Vector";
import { Matrix } from "../Linear Algebra/Matrix";
import { PermutationCubeState } from "./PermutationCubeState";

export class PermutationCubeStateConverter {

	constructor() { }

	save(cubeState:CubeState): PermutationCubeState {
		const permutations = [new Array<number>(), new Array<number>(), new Array<number>()];
		const orientations = [new Array<number>(), new Array<number>(), new Array<number>()];
		let log:boolean=false;
		let logstring = 'getState: ';
		for (const cubeletState of cubeState.cubelets) {
			let initialLocation=new CubeletLocation(cubeState.spec,cubeletState.initialLocation);
			let location=new CubeletLocation(cubeState.spec,cubeletState.location);
			let orientation= new CubeletOrientation(cubeletState.orientation);
			permutations[initialLocation.type.countDimensions()][this.indexFromLocation(cubeState.spec,initialLocation)] = this.indexFromLocation(cubeState.spec, location)
			orientations[initialLocation.type.countDimensions()][this.indexFromLocation(cubeState.spec,initialLocation)] = this.reorientationNumberFromMatrix(initialLocation.part, location.part, orientation);
			//if (log) logstring = logstring + ' At[' + this.indexFromLocation(initialLocation).toString() + ']' + cubical.toString() + " ";
		}

		if(log) logstring = logstring + permutations.toString() + orientations.toString();
		if(log) console.log(logstring);

		return new PermutationCubeState(cubeState.spec, cubeState.solv, permutations, orientations);
	}

	load(state: PermutationCubeState): CubeState {
		let cubeletStates=new Array<CubeletState>();
		for (const type of CubePartType.getAll()) {
			for(let index=0;index < type.countLocations(state.spec);index++) {
			const initialLocation = this.indexToLocation(state.spec,index,type);
			const location = this.indexToLocation(state.spec, state.permutations[type.index][index], type);
			const orientation = this.reorientationNumberToMatrix(initialLocation.part, location.part, state.reorientations[type.index][index]);
			cubeletStates.push(new CubeletState(initialLocation.origin,location.origin,orientation.matrix));	
			}	
		}
		return new CubeState(state.spec,state.solv,cubeletStates);	
	}


	/** Index of a CubicalLocations by type. 
	 * The format is cubePartIndex*(N-2)^d+(remainingCoordinate[0]-1)*(N-2)^(d-1)...
	 * while remainingCoordinate[0] enumerates the possible values -max+1....max-1
	 * @param spec 
	 * @param CubicalLocation 
	 */
	public indexFromLocation(spec:CubeSpecification, cubeLocation: CubeletLocation): number {
		const componentMaximum = (cubeLocation.spec.edgeLength - 1) / 2;
		let result = cubeLocation.part.index;
		//encodes the remainingCoordinates 0...(N-3)^d, since each remainingCoordinate is -componentMaximum+1...componentMaximum-1
		for (let remainingCoordinate of cubeLocation.originComponentsInPartDimensions) {
			result = (remainingCoordinate+componentMaximum- 1) + result * (spec.edgeLength - 2);
		}
		//result=result+1; // from 0-based to to 1-based
		return result; 
	}

	/** CubeLocation with a given index by type. The format is cubePartIndex*(N-2)^d+remainingCoordinate[0]*(N-2)^(d-1)...
	 * while remainingCoordinate[0] enumerates the possible values -max+1....max-1
	 */
	public indexToLocation(spec:CubeSpecification, indexByType: number, type: CubePartType): CubeletLocation {
		const componentMaximum = (spec.edgeLength - 1) / 2;
		//indexByType=indexByType-1; // from 1-based to to 0-based 
		let remainingCoordinates = new Array<number>();
		for (let i = type.countDimensions() - 1; i >= 0; i--) {
			remainingCoordinates[i] = (indexByType % (spec.edgeLength - 2))-componentMaximum + 1;
			indexByType = Math.floor(indexByType / (spec.edgeLength - 2));
		}
		let cubePart: CubePart = CubePart.getByTypeAndIndex(type, indexByType);
		return CubeletLocation.fromPartAndOriginComponentsInPartDimensions(spec, cubePart, remainingCoordinates);
	}

	/** Returns a number 0....CubePart.normalVectors.length-1 that expresses how the Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	 */
	public reorientationNumberFromMatrix(initialPart: CubePart, newPart: CubePart, orientation: CubeletOrientation): number {
		let log:boolean=false;
		let logstring = 'reorientationNumberFromMatrix ' + initialPart.toString() + "->" + newPart.toString() + "|" + orientation.matrix.toString() + "\n";
		let transformedNormalVectors = new Array<Vector>();
		let transformedTangentVectors = new Array<Vector>();
		let newlocationNormalVectors = new Array<Vector>();
		let newlocationTangentVectors = new Array<Vector>();

		if (initialPart.type != newPart.type) throw new Error('CubeParts not matching type')
		for (let i: number = 0; i < initialPart.type.countNormalVectors(); i++) {
			transformedNormalVectors.push(orientation.matrix.vectorMultiply(initialPart.normalVectors[i].getNormalVector()));
			newlocationNormalVectors.push(newPart.normalVectors[i].getNormalVector());
			if(log) logstring = logstring + '(' + transformedNormalVectors[i].toString() + '/' + newlocationNormalVectors[i].toString() + ')';
		}
		for (let i: number = 0; i < 3-initialPart.type.countNormalVectors(); i++) {
			transformedTangentVectors.push(orientation.matrix.vectorMultiply(initialPart.tangentVectors[i].getNormalVector()));
			newlocationTangentVectors.push(newPart.tangentVectors[i].getNormalVector());
			if(log) logstring = logstring + '(' + transformedTangentVectors[i].toString() + '/' + newlocationTangentVectors[i].toString() + ')';
		}
		if(log)console.log(logstring);
	
		//Find out how the normal vectors are cyclically permuted and how the tangent vectors are rotated
		//In arbitrary dimension we would combine these two types of information, but in dimension 3 this means 
		//* for CORNER 3 normal vectors, for EDGE 2 normal vectors (and no or a already fixed tangent vectors )
		//* for FACE 4 possible roations of the tangent vector (and 1 fixed normal vector)
		
		if (initialPart.type == CubePartType.FACE) {
			for (let reorientationNumber = 0; reorientationNumber < 4; reorientationNumber++) {
				if (transformedTangentVectors[0].equals(newlocationTangentVectors[0])) return reorientationNumber;
				//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
				transformedTangentVectors[0] = transformedTangentVectors[0].crossProduct(transformedNormalVectors[0]);
			}
		}
		else {
			for (let reorientationNumber = 0; reorientationNumber < initialPart.type.countNormalVectors(); reorientationNumber++) {
				if (transformedNormalVectors[0].equals(newlocationNormalVectors[0])) return reorientationNumber;
				//shift index by 1
				transformedNormalVectors = transformedNormalVectors.concat(transformedNormalVectors.splice(0, 1));
			}
		}
		throw new Error('Cannot bring the sets of normal and additional vectors to coincide (cube with illegal reorientations to start with?)');
	}

	/** Takes a number 0....CubePart.normalVectors.length-1 and finds a Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	* Because Face has four normal vectors (instead of one), the function is unique
	*/
	public reorientationNumberToMatrix(initialPart: CubePart, newPart: CubePart, reorientationNumber: number): CubeletOrientation {
		let log:boolean=false;
		let logstring = 'reorientationNumberFromMatrix ' + initialPart.toString() + "->" + newPart.toString() + "|" + reorientationNumber.toString() + "\n";
		let initialLocationNormalVectors = new Array<Vector>();
		let initialLocationTangentVectors = new Array<Vector>();
		let newLocationNormalVectors = new Array<Vector>();
		let newLocationTangentVectors = new Array<Vector>();

		if (initialPart.type != newPart.type) throw new Error('CubeParts not matching type')
		for (let i: number = 0; i < initialPart.type.countNormalVectors(); i++) {
			initialLocationNormalVectors.push(initialPart.normalVectors[i].getNormalVector());
			newLocationNormalVectors.push(newPart.normalVectors[i].getNormalVector());
			if (log) logstring = logstring + '(' + initialLocationNormalVectors[i].toString() + '/' + newLocationNormalVectors[i].toString() + ')';
		}
		for (let i: number = 0; i < 3-initialPart.type.countNormalVectors(); i++) {
			initialLocationTangentVectors.push(initialPart.tangentVectors[i].getNormalVector());
			newLocationTangentVectors.push(newPart.tangentVectors[i].getNormalVector());
			if (log) logstring = logstring + '(' + initialLocationTangentVectors[i].toString() + '/' + newLocationTangentVectors[i].toString() + ')';
		}
		if (log) console.log(logstring);
	


		//shift according to reorientationNumber
		if (initialPart.type == CubePartType.FACE) {
			//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
			for (let i = 0; i < reorientationNumber; i++) 
			{ 
				initialLocationTangentVectors[0] = initialLocationTangentVectors[0].crossProduct(initialLocationNormalVectors[0]); 
				initialLocationTangentVectors[1] = initialLocationTangentVectors[1].crossProduct(initialLocationNormalVectors[0]); 
			}
		}
		else {
			//shift index
			initialLocationNormalVectors = initialLocationNormalVectors.concat(initialLocationNormalVectors.splice(0, reorientationNumber));
		}

		//Solve for matrix: It is enough to match the first one?
		let initialLocationBasis = initialLocationNormalVectors.concat(initialLocationTangentVectors);
		let newLocationBasis = newLocationNormalVectors.concat(newLocationTangentVectors);
		return new CubeletOrientation(Matrix.forBaseChange(initialLocationBasis, newLocationBasis));
	}



}