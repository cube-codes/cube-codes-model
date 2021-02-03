import { CubeState } from "./CubeState";
import { CubeSpecification } from "../Cube Geometry/CubeSpecification";
import { CubeFace } from "../Cube Geometry/CubeFace";
import { Vector } from "../Linear Algebra/Vector";
import { CubeletState, CubePartType, Matrix } from "..";
import { CubeletLocation } from "../Cube/CubeletLocation";
import { CubePart } from "../Cube Geometry/CubePart";
import { CubeSolutionCondition, CubeSolutionConditionType } from "../Cube/CubeSolutionCondition";



/** Tools to read and write a textual diagram displaying where and in which orientation the cubicals are. However, the orientation of faces and different edges with same coloring (for N>3) are not distinguishable in this presentation 
 * TODO Extend to accompany these informations (but then it becomes less human readible)
 * TODO: Die Spec muss aus dem Beginn des Strings gelesen werden
 */
export class ColorCubeLanguage {


	constructor(readonly spec:CubeSpecification) { }

	private static parseSticker(stickerString: String | undefined): CubeFace {
		switch (stickerString) {
			case 'F': return CubeFace.FRONT;
			case 'R': return CubeFace.RIGHT;
			case 'U': return CubeFace.UP;
			case 'B': return CubeFace.BACK;
			case 'L': return CubeFace.LEFT;
			case 'D': return CubeFace.DOWN;
			default: throw 'Invalid sticker string literal: ' + stickerString;
		}
	}

	private static stringifySticker(cubeFace:CubeFace) {
		switch (cubeFace) {
			case CubeFace.FRONT : return 'F';
			case CubeFace.RIGHT : return 'R';
			case CubeFace.UP : return 'U';
			case CubeFace.BACK : return 'B';
			case CubeFace.LEFT : return 'L';
			case CubeFace.DOWN : return 'D';
			default: throw 'Invalid Sticker ';
		}
	}


	parse(stateString: string): CubeState {

		//1) READ STRING

		//TODO Allow more letters!!!
		let stickerString: Array<String> = stateString.split(/\s+/).filter(function(s) { return s !== ''; }).reverse(); 
		const N: number = this.spec.edgeLength;
		if (stickerString.length != 6*N*N) throw new Error('Wrong number of stickers');

		const coordinates: Array<Vector> = new Array<Vector>();
		const colors: Array<CubeFace> = new Array<CubeFace>();

		const shift=-(this.spec.edgeLength/2-0.5)

		let x: number;
		let y: number;
		let z: number;
		let l: number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for (l = 0; l <= N - 1; l++) {
			//UP
			y = N;
			z = N - 1 - l;
			for (x = 0; x <= N - 1; x++) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
		}

		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = -1;
			y = N-1-l;
			for (z = N - 1; z >= 0; z--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
			//FRONT
			z = N;
			y = N-1-l;
			for (x = 0; x <= N-1; x++) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
			//RIGHT
			x = N;
			y = N-1-l;
			for (z = N-1; z >= 0; z--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
			//BACK
			z = -1;
			y = N-1-l;
			for (x = N-1; x >= 0; x--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
		}

		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			//DOWN
			y = -1;
			z = N-1-l;
			for (x = 0; x <= N-1; x++) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new Vector([x+shift, y+shift, z+shift]));
			}
		}

		/*let logstring_colorcube='';
		for(let i=0;i<6*N*N;i++) {logstring_colorcube=logstring_colorcube+ " "+ ColorCubeLanguage.stringifySticker(colors[i])+coordinates[i].toString()}
		console.count(logstring_colorcube);*/

		//2) SEARCH IN THIS "COLOR CUBE" FOR CUBICALS
		//let permutations=[new Array<number>(),new Array<number>(),new Array<number>(),];
		//let reorientations=[new Array<number>(),new Array<number>(),new Array<number>(),];
		let cublets= Array<CubeletState>();

		for(let type of CubePartType.getAll()) {
			//Make a pool of all initialLocations (=cublets) of this type, to cross out those we have found already
			let initialLocationsPool=Array<CubeletLocation>();
			for (let part of CubePart.getByType(type)) {
				for (let cubicalLocation of CubeletLocation.fromPart(this.spec,part)){
					initialLocationsPool.push(cubicalLocation);
				}
			}
			//go through all locations
			for (let part of CubePart.getByType(type)) {
				for (let location of CubeletLocation.fromPart(this.spec,part)){
					//memorize colors at this location
					let cubicalColors = new Array<CubeFace>();
					for (let face of location.part.normalVectors) {
						cubicalColors.push(ColorCubeLanguage.getColorAt(location.origin.add(face.getNormalVector()),colors,coordinates))
						//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
					}				
				
					//search for initialLocation i.e. cubelets (several initialLocations have the same color, so there are many solutions, which is also why we need the pool)
					//ToDo can be improved greatly using matrix calculations? 
					let found:boolean=false; //to detect if nothing is found
					search:
					//i as index in the array because otherwise deleting from the array is difficult
					for(let i=0; i< initialLocationsPool.length;i++) {
						let initialLocation=initialLocationsPool[i];
						let initialNormalVectors=ColorCubeLanguage.CubefaceArrayToVectorArray(initialLocation.part.normalVectors);
						let initialTangentVectors=ColorCubeLanguage.CubefaceArrayToVectorArray(initialLocation.part.tangentVectors);
						let normalVectors=ColorCubeLanguage.CubefaceArrayToVectorArray(location.part.normalVectors);
						let tangentVectors=ColorCubeLanguage.CubefaceArrayToVectorArray(location.part.tangentVectors);
						//Now tries to match the normal vectors (tangent vectors have no color, so there are many solutions for FACE)
						for (let rotation = 0; rotation < type.countNormalVectors(); rotation++) {
							if (ColorCubeLanguage.ColorVectorEquals(cubicalColors,initialLocation.part.normalVectors)) { 
								found = true;
								initialLocationsPool.splice(i, 1); //Remove possibility from pool
								let orientation=Matrix.forBaseChange(initialNormalVectors.concat(initialTangentVectors),normalVectors.concat(tangentVectors));
								cublets.push(new CubeletState(initialLocation.origin,location.origin,orientation));
								break search;
							}
							//Try different rotation
							cubicalColors=cubicalColors.concat(cubicalColors.splice(0,1));
							initialNormalVectors=initialNormalVectors.concat(initialNormalVectors.splice(0,1));
						}
					}
					if (!found) throw new Error('Not found cubical with color combination ' + cubicalColors[0].toString());
				}
			}
		}
		return new CubeState(this.spec, new CubeSolutionCondition(CubeSolutionConditionType.COLOR),cublets);
	}
	

	stringify(cubeState:CubeState):string {
		if(this.spec!=cubeState.spec) throw new Error("Language and State have different Spec");

		//1) BUILD A "COLOR CUBE" WITH COLORS INSERTED AT LOCATION+NORMALVECTOR

		const N: number = this.spec.edgeLength
		const shift=-(this.spec.edgeLength/2-0.5)


		const colors: Array<CubeFace> = new Array<CubeFace>();
		const coordinates: Array<Vector> = new Array<Vector>();
		
		//Go throgh all cublets 
		for(let cubeletState of cubeState.cubelets) {
			let initialLocation = new CubeletLocation(this.spec,cubeletState.initialLocation);
			for(let face of initialLocation.part.normalVectors) {
				let transformedNormalVectors=cubeletState.orientation.vectorMultiply(face.getNormalVector());
				colors.push(face);
				coordinates.push(cubeletState.location.add(transformedNormalVectors));
			}
		}
	
		/*let logstring_colorcube='';
		for(let i=0;i<6*N*N;i++) {logstring_colorcube=logstring_colorcube+ " "+ ColorCubeLanguage.stringifySticker(colors[i])+coordinates[i].toString()}
		console.count(logstring_colorcube);*/
		
		//2) WRITE STRING
		
		const separator: String = new String(' ');
		const faceseparator: String = new String('  ').repeat(N);
		const linebreak: String = '\n';

		var result: string = '';
		var x: number;
		var y: number;
		var z: number;
		var l: number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for (l = 0; l <= N - 1; l++) {
			result = result + faceseparator;
			//UP
			y = N;
			z = N - 1 - l;
			for (x = 0; x <= N - 1; x++) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			result.substring(0, result.length - separator.length);
			result = result + faceseparator;
			result = result + faceseparator;
			result = result + linebreak;
		}
		
		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = -1;
			y = N-1-l;
			for (z = N - 1; z >= 0; z--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			//FRONT
			z = N;
			y = N-1-l;
			for (x = 0; x <= N-1; x++) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			//RIGHT
			x = N;
			y = N-1-l;
			for (z = N-1; z >= 0; z--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			//BACK
			z = -1;
			y = N-1-l;
			for (x = N-1; x >= 0; x--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			result = result + linebreak;
			}
		
		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			result = result + faceseparator;
			//DOWN
			y = -1;
			z = N-1-l;
			for (x = 0; x <= N-1; x++) {				
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new Vector([x+shift, y+shift, z+shift]),colors,coordinates))+separator;
			}
			result.substring(0, result.length - separator.length);
			result = result + faceseparator;
			result = result + faceseparator;
			result = result + linebreak;
		}
		return result;
	}



	//Should be implemented less expensive using coordinate as a key of a map Coordinates->Color
	static getColorAt(coordinates:Vector, allColors: Array<CubeFace>,allCoordinates: Array<Vector>):CubeFace {
		if (allColors.length!=allCoordinates.length) throw new Error('Array size not matching');
		for(let i=0;i<allColors.length; i++) {
			if(coordinates.equals(allCoordinates[i])) return allColors[i];
		}
		throw new Error('No color found at coordintes '+coordinates.toString());
	}

	/** Computes, which initial face (color) is shown if one looks at the cube at the new location on some face.
	 * 
	 * @param cubeFace The face from which we look at the cubical
	 *
	getColorShownOnSomeFace(cubeFace: CubeFace): CubeFace {
		this.location.part.isContainedInFace(cubeFace); // just validates the request
		let result: CubeFace = CubeFace.getByNormalVector(cubeFace.getNormalVector().transformAroundZero(inv(this.orientation.matrix)));
		this.initialLocation.part.isContainedInFace(result); // just validates the result
		return result;
	}*/
	
/////////////////////////////////////////////////////////////////
// Utilities that might be betterfrom some existing Array functions I dont know
	
	private static ColorVectorEquals(colors1:ReadonlyArray<CubeFace>, colors2:ReadonlyArray<CubeFace>) {
		if (colors1.length!=colors2.length) return false;
		for(let index=0;index<colors1.length;index++) {
			if (!colors1[index].equals(colors2[index])) return false;
		}
		return true;
	}

	private static CubefaceArrayToVectorArray(array:ReadonlyArray<CubeFace>) : Array<Vector> {
		let result=new Array<Vector>();
		for (let i=0;i<array.length;i++) {
			result.push(array[i].getNormalVector());
		}
		return result;
	}
}








