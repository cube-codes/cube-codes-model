import { CubeState } from "./CubeState";
//import { CubicalLocation } from "./Cubical";
import { CubeFace, CubePartType } from "../Cube Geometry/CubePart";
import { CubeSpecification, CubeCoordinates} from "../Linear Algebra/Vector";
import deepEqual from "deep-equal";



//TODO: Die Klasse CubeStateLanguage soll einfach eine Funktion parse(stateString) => CubeState und eine Methode stringify(CubeState) => string haben
//TODO: Die Spec muss aus dem Beginn des Strings gelesen werden
export class CubeStateLanguage {

	constructor(readonly spec:CubeSpecification) {}

	parse(stateString: string): CubeState {
		throw new Error('To be implemented'); //Simply Serialize Arrays
	}

	stringify(state: CubeState): string {
		throw new Error('To be implemented');
	}
}

/** Tools to read and write a textual diagram displaying where and in which orientation the cubicals are. However, the orientation of faces and different edges with same coloring (for N>3) are not distinguishable in this presentation 
 * TODO Extend to accompany these informations (but then it becomes less human readible)
 */
export class ColorCubeLanguage {

	constructor(readonly spec:CubeSpecification) {}

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

		const coordinates: Array<CubeCoordinates> = new Array<CubeCoordinates>();
		const colors: Array<CubeFace> = new Array<CubeFace>();

		let x: number;
		let y: number;
		let z: number;
		let l: number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for (l = 0; l <= N - 1; l++) {
			//UP
			y = -1;
			z = N - 1 - l;
			for (x = N - 1; x >= 0; x--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = N;
			y = l;
			for (z = N - 1; z >= 0; z--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//FRONT
			z = -1;
			y = l;
			for (x = N - 1; x >= 0; x--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//RIGHT
			x = -1;
			y = l;
			for (z = 0; z <= N - 1; z++) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//BACK
			z = N;
			y = l;
			for (x = 0; x <= N - 1; x++) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			//DOWN
			y = N;
			z = l;
			for (x = N - 1; x >= 0; x--) {
				colors.push(ColorCubeLanguage.parseSticker(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		/*let logstring_colorcube='';
		for(let i=0;i<6*N*N;i++) {logstring_colorcube=logstring_colorcube+ " "+ ColorCubeLanguage.stringifySticker(colors[i])+coordinates[i].toString()}
		console.count(logstring_colorcube);*/

		//2) SEARCH IN THIS "COLOR CUBE" FOR CUBICALS
		let permutations=[new Array<number>(),new Array<number>(),new Array<number>(),];
		let reorientations=[new Array<number>(),new Array<number>(),new Array<number>(),];

		for(let type of CubePartType.getAll()) {
			let initialLocationsPool=Array<number>();
			for(let initialIndex=0;initialIndex<type.countLocations(this.spec);initialIndex++) { initialLocationsPool.push(initialIndex); }
			//go through all locations
			for(let index=0;index<type.countLocations(this.spec);index++) { 
				//memorize colors at this location
				const cubicalLocation=CubeState.indexToLocation(this.spec,index, type);
				let locationNormalVectors= new Array<CubeCoordinates>();
				for(let face of cubicalLocation.part.neighbouringFaces) locationNormalVectors.push(face.getNormalVector()); //in order to match orientation later
				let cubicalColors = new Array<CubeFace>();
				for (let face of cubicalLocation.part.neighbouringFaces) {
					cubicalColors.push(ColorCubeLanguage.getColorAt(cubicalLocation.coordinates.add(face.getNormalVector()),colors,coordinates))
					//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				}				
			
				//search for initial location and rotation
				//ToDo can be improved greatly using matrix calculations?
				let initialIndex=0; //Result of the search
				let rotation: number=0; //Result of the search
				let found:boolean=false;
				search:
				for(initialIndex of initialLocationsPool) {
					let initiallocation = CubeState.indexToLocation(this.spec,initialIndex, type); 
					let initialLocationNormalVectors =new Array<CubeCoordinates>();
					for(let face of initiallocation.part.neighbouringFaces) initialLocationNormalVectors.push(face.getNormalVector()); //in order to match orientation later

					for (rotation = 0; rotation < 3; rotation++) {
						if (deepEqual(cubicalColors,initiallocation.part.neighbouringFaces)) {
							found = true;
							initialLocationsPool.splice(initialLocationsPool.indexOf(initialIndex), 1); //Remove from List
							break search;
						}
						//Try different rotation
						cubicalColors=cubicalColors.concat(cubicalColors.splice(0,1));
					}
				}
				if (!found) throw new Error('Not found cubical with color combination ' + cubicalColors[0].toString());
				permutations[type.dimensionsCount][initialIndex]=index;
				reorientations[type.dimensionsCount][initialIndex]=rotation;
			}
		}
		return new CubeState(this.spec,permutations,reorientations);
	}
	

	stringify(cubeState:CubeState):String {
		if(this.spec!=cubeState.spec) throw new Error("Language and State have different Spec");

		//1) BUILD A "COLOR CUBE" WITH COLORS INSERTED AT LOCATION+NORMALVECTOR

		const N: number = this.spec.edgeLength
		const colors: Array<CubeFace> = new Array<CubeFace>();
		const coordinates: Array<CubeCoordinates> = new Array<CubeCoordinates>();
		
		//Go throgh all initianLocations
		for(let type of CubePartType.getAll()) {
			for(let initialIndex=0;initialIndex<type.countLocations(this.spec);initialIndex++) { 

				let initialLocation=CubeState.indexToLocation(this.spec,initialIndex, type);
				let newLocation=CubeState.indexToLocation(this.spec,cubeState.permutations[type.dimensionsCount][initialIndex], type);
				let reorientationNumber=cubeState.reorientations[type.dimensionsCount][initialIndex];

				for (let i=0;i<initialLocation.part.neighbouringFaces.length;i++) {
					//rotate colors or coordinates?
					colors.push(initialLocation.part.neighbouringFaces[(i + reorientationNumber)%initialLocation.part.neighbouringFaces.length]);
					coordinates.push(newLocation.coordinates.add(newLocation.part.neighbouringFaces[i].getNormalVector()));

				}
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
			y = -1;
			z = N - 1 - l;
			for (x = N - 1; x >= 0; x--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			result.substring(0, result.length - separator.length);
			result = result + faceseparator;
			result = result + faceseparator;
			result = result + linebreak;
		}

		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = N;
			y = l;
			for (z = N - 1; z >= 0; z--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			//FRONT
			z = -1;
			y = l;
			for (x = N - 1; x >= 0; x--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			//RIGHT
			x = -1;
			y = l;
			for (z = 0; z <= N - 1; z++) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			//BACK
			z = N;
			y = l;
			for (x = 0; x <= N - 1; x++) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			result = result + linebreak;
		}

		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			result = result + faceseparator;
			//DOWN
			y = N;
			z = l;
			for (x = N - 1; x >= 0; x--) {
				result = result + ColorCubeLanguage.stringifySticker(ColorCubeLanguage.getColorAt(new CubeCoordinates(x, y, z),colors,coordinates))+separator;
			}
			result.substring(0, result.length - separator.length);
			result = result + faceseparator;
			result = result + faceseparator;
			result = result + linebreak;
		}
		return result;
	}



	//Should be implemented less expensive using coordinate as a key of a map Coordinates->Color
	static getColorAt(coordinates:CubeCoordinates, allColors: Array<CubeFace>,allCoordinates: Array<CubeCoordinates>):CubeFace {
		if (allColors.length!=allCoordinates.length) throw new Error('Array size not matching');
		for(let i=0;i<allColors.length; i++) {
			if(deepEqual(coordinates,allCoordinates[i])) return allColors[i];
		}
		throw new Error('No color found at coordintes '+CubeCoordinates.toString());
	}
}
