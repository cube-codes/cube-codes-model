import { CubeCoordinates, CubeSpecification } from "./CubeGeometry";
import { CubePartType, CubePart } from "./CubePart";
import { CubicalLocation, CubicalOrientation } from "./Cubical";
import { Matrices } from "../Utilities/Matrices";
import deepEqual from "deep-equal";


/** The CubeState encodes the permutations and reorientations. 
 * 
 * They are encoded by indices (corresponding to locations on any cubePart) and reorientation numbers (how the normal vectors are shifted with respect to a fixed standard ordering) - the class provides static methods to convert these indices
 * 
 */
export class CubeState {

	constructor(readonly spec: CubeSpecification,
		readonly permutations:Array<Array<number>>,
		readonly reorientations:Array<Array<number>>,
		) {
			//TODO: Validate input data? (Permutations.length=3, Permutation[type].length=CubicalLocation.count(type), Permutation[type] is a permutation i.e. contains any value once.... ) 
		}
		
	/** Numbering of the possible CubicalLocations of each type, depending on the cubes edgelength. To be used in CubeState and in random state generation and in strings
	 * 
	*/		
	static countLocations(spec:CubeSpecification, type:CubePartType) {
		switch(type) {
			case CubePartType.CORNER:
				return 8; 
			case CubePartType.EDGE:
				return 12 * (spec.edgeLength - 2);
			case CubePartType.FACE:
				return 6 * Math.pow(spec.edgeLength - 2, 2)
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	}
	
	/** Index of a CubicalLocations by type. The format is cubePartIndex*(N-2)^d+(remainingCoordinate[0]-1)*(N-2)^(d-1)...
	 * 
	 * @param spec 
	 * @param CubicalLocation 
	 */
	static indexFromLocation(spec:CubeSpecification,cubeLocation:CubicalLocation):number{
		let result=cubeLocation.cubePart.index; 
		//encodes the remainingCoordinates 0...(N-3)^d, since each remainingCoordinate is 1...N-2
		for (let remainingCoordinate of cubeLocation.remainingCoordinates) {
			result=(remainingCoordinate-1)+result*(spec.edgeLength-2);
		}
		return result;
	}
	
	/** CubeLocation with a given index by type. The format is cubePartIndex*(N-2)^d+remainingCoordinate[0]*(N-2)^(d-1)...
	 * 
	 */
	static indexToLocation(spec:CubeSpecification,indexByType:number,type:CubePartType):CubicalLocation {
		let remainingCoordinates=new Array<number>();
		for (let i=type-1;i>=0;i--) {
			remainingCoordinates[i]=(indexByType % (spec.edgeLength-2))+1;
			indexByType=Math.floor(indexByType/(spec.edgeLength-2));
		}
		let cubePart:CubePart=CubePart.fromIndexByType(indexByType,type);
		return CubicalLocation.fromCubePartAndRemainingCoordinates(spec,cubePart,remainingCoordinates);
	}

	/** Returns a number 0....CubePart.normalVectors.length-1 that expresses how the Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	 */
	static reorientationNumberFromMatrix(initialPart:CubePart, newPart:CubePart,orientation:CubicalOrientation):number {
		let logstring='reorientationNumberFromMatrix '+initialPart.toString()+"->"+newPart.toString()+"|"+orientation.matrix.toString()+"\n";
		let transformedNormalVectors=new Array<CubeCoordinates>();
		let newlocationNormalVectors=new Array<CubeCoordinates>();
		if (initialPart.type!=newPart.type) throw new Error('CubeParts not matching type')
		for (let i:number=0;i<initialPart.getNeighbouringAndAdditionalFaces().length;i++) {
			transformedNormalVectors.push(initialPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector().transformAroundZero(orientation.matrix));
			newlocationNormalVectors.push(newPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			logstring=logstring+'('+transformedNormalVectors[i].toString()+'/'+newlocationNormalVectors[i].toString()+')';
		}
		//console.log(logstring);
		//Find out how the two vector pairs are shifted in comparisment
		//Just very different for Face (one one normal vector) and others (no additional vector)
		if (initialPart.type==CubePartType.FACE) {
			for(let reorientationNumber=0;reorientationNumber<4;reorientationNumber++) {
				if(deepEqual(transformedNormalVectors,newlocationNormalVectors)) return reorientationNumber;
				//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
				transformedNormalVectors[1]=transformedNormalVectors[1].crossProduct(transformedNormalVectors[0]);
			}
		}
		else {
			for(let reorientationNumber=0;reorientationNumber<newPart.getNeighbouringAndAdditionalFaces().length;reorientationNumber++) {
				if(deepEqual(transformedNormalVectors,newlocationNormalVectors)) return reorientationNumber;
				//shift index by 1
				transformedNormalVectors=transformedNormalVectors.concat(transformedNormalVectors.splice(0,1));
			}
		}
		throw new Error('Cannot bring the sets of normal and tangent vectors to coincide (transformed initial location NormalVectors and new location NormalVectors are different sets?)');
	}

	/** Takes a number 0....CubePart.normalVectors.length-1 and finds a Matrix (mapping the normal vectors at initiallocation to normal vectors at newlocation) are shifted with respect to the fixed order of the normal vectors at both places
	* Because Face has four normal vectors (instead of one), the function is unique
	*/
	static reorientationNumberToMatrix(initialPart:CubePart, newPart:CubePart,reorientationNumber:number):CubicalOrientation {
		let logstring='reorientationNumberFromMatrix '+initialPart.toString()+"->"+newPart.toString()+"|"+reorientationNumber.toString()+"\n";
		let initialLocationNormalVectors=new Array<CubeCoordinates>();
		let newLocationNormalVectors=new Array<CubeCoordinates>();
		if (initialPart.type!=newPart.type) throw new Error('CubeParts not matching type')

		for (let i:number=0;i<initialPart.getNeighbouringAndAdditionalFaces().length;i++) {
			initialLocationNormalVectors.push(initialPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			newLocationNormalVectors.push(newPart.getNeighbouringAndAdditionalFaces()[i].getNormalVector());
			logstring=logstring+'('+initialLocationNormalVectors[i].toString()+'/'+newLocationNormalVectors[i].toString()+')';
		}
		//console.log(logstring);


		//shift according to reorientationNumber
		if (initialPart.type==CubePartType.FACE) {
			//rotate the only one transformedNormalVector counterclockwise around the only one normal vector
			for (let i=0;i<reorientationNumber;i++) {initialLocationNormalVectors[1]=initialLocationNormalVectors[1].crossProduct(initialLocationNormalVectors[0]);}
		}
		else {
			//shift index
			initialLocationNormalVectors=initialLocationNormalVectors.concat(initialLocationNormalVectors.splice(0,reorientationNumber));
		}		

		//Solve for matrix: It is enough to match the first one?
		switch(initialPart.type) {
			case CubePartType.CORNER: return new CubicalOrientation(Matrices.getTransitivityMatrix(initialLocationNormalVectors[0],initialLocationNormalVectors[1],initialLocationNormalVectors[2], newLocationNormalVectors[0],newLocationNormalVectors[1],newLocationNormalVectors[2]));
			case CubePartType.EDGE: return new CubicalOrientation(Matrices.getTransitivityOrthogonalMatrix(initialLocationNormalVectors[0],initialLocationNormalVectors[1], newLocationNormalVectors[0],newLocationNormalVectors[1]));
			case CubePartType.FACE: return new CubicalOrientation(Matrices.getTransitivityOrthogonalMatrix(initialLocationNormalVectors[0],initialLocationNormalVectors[1],newLocationNormalVectors[0],newLocationNormalVectors[1]));
		}
	}
	
	/** Outputs the data of a CubeState. Used for debug and lesson "permutation" and "orbit"
	 * 
	 */
	public toFormattedString(): string {
		return 	'Corner Permutations:   [' + this.permutations[0].toString() + "] \n" +
				'Edge   Permutations:   [' + this.permutations[1].toString() + "] \n" +
				'Face   Permutations:   [' + this.permutations[2].toString() + "] \n" + 
				'Corner Reorientations: [' + this.reorientations[0].toString() + "] \n"+
				'Edge   Reorientations: [' + this.reorientations[1].toString() + "] \n"+
				'Face   Reorientations: [' + this.reorientations[2].toString() + "] \n";
	}

}
