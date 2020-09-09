import { CubeState } from "./CubeState";


//TODO: Die Klasse CubeStateLanguage soll einfach eine Funktion parse(stateString) => CubeState und eine Methode stringify(CubeState) => string haben
//TODO: Die Spec muss aus dem Beginn des Strings gelesen werden
export class CubeStateLanguage {

	parse(stateString: string): CubeState {
		throw new Error('To be implemented');
	}

	stringify(state: CubeState): string {
		throw new Error('To be implemented');
	}

}


// OLD

/*
export class CubeStateLanguageOLD {

	constructor(readonly spec: CubeSpecification) {}

	private parseSticker(stickerString: String): CubeFace {
		switch (stickerString) {
			case '0': return 0;
			case '1': return 1;
			case '2': return 2;
			case '3': return 3;
			case '4': return 4;
			case '5': return 5;
			default: throw 'Invalid color string literal: ' + stickerString;
		}
	}

	parse(stateString: string): CubeState {

		//TODO: Allow more letters!!!
		const stickerString: ReadonlyArray<String> = stateString.split(/\s+/).filter(function(s) { return s !== ''; }).reverse(); // Simon fragen warum reversen????
		const N: number = this.spec.edgeLength;
		
		const coordinates: Array<CubeCoordinates> = new Array<CubeCoordinates>();
		const colors: Array<number> = new Array<number>();

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
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = N;
			y = l;
			for (z = N - 1; z >= 0; z--) {
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//FRONT
			z = -1;
			y = l;
			for (x = N - 1; x >= 0; x--) {
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//RIGHT
			x = -1;
			y = l;
			for (z = 0; z <= N - 1; z++) {
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
			//BACK
			z = N;
			y = l;
			for (x = 0; x <= N - 1; x++) {
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			//DOWN
			y = N;
			z = l;
			for (x = N - 1; x >= 0; x--) {
				colors.push(CubeStateLanguage.fromStringLiteral(stickerString.pop()));
				coordinates.push(new CubeCoordinates(x, y, z));
			}
		}

		return new ColoredCube(spec, coordinates, colors);

	}




	private static toStringLiteral(color: number): string {
		return color.toString() + ' ';
	}
	private static toStringLiteralEmpty(): string {
		return '  ';
	}


	public toString(coloredCube: ColoredCube): string {
		return CubeStateLanguage.toString(coloredCube);
	}

	public static toString(coloredCube: ColoredCube) {
		/*
		//If toString does not work due to errors
 		const rawToString:string=coloredCube.cubeCoordinates.length.toString()+' Entries \n';
		for(const i:number=0;i<coloredCube.cubeCoordinates.length;i++) {
			rawToString=rawToString+'*'+coloredCube.cubeCoordinates[i].toString()+'='+coloredCube.colors[i].toString()+"\n";
		}	
		console.log('Color Cube rawToString'+rawToString);
		*



		const N: number = coloredCube.spec.edgeLength
		const separator: string = CubeStateLanguage.toStringLiteralEmpty().repeat(N);
		const linebreak: string = '\n';

		const result: string = '';
		const x: number;
		const y: number;
		const z: number;
		const l: number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for (l = 0; l <= N - 1; l++) {
			result = result + separator;
			//UP
			y = -1;
			z = N - 1 - l;
			for (x = N - 1; x >= 0; x--) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			result = result + separator;
			result = result + separator;
			result = result + linebreak;
		}

		//SECOND BLOCK
		for (l = 0; l <= N - 1; l++) {
			//LEFT
			x = N;
			y = l;
			for (z = N - 1; z >= 0; z--) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			//FRONT
			z = -1;
			y = l;
			for (x = N - 1; x >= 0; x--) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			//RIGHT
			x = -1;
			y = l;
			for (z = 0; z <= N - 1; z++) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			//BACK
			z = N;
			y = l;
			for (x = 0; x <= N - 1; x++) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			result = result + linebreak;
		}

		//THIRD BLOCK
		for (l = 0; l <= N - 1; l++) {
			result = result + separator;
			//DOWN
			y = N;
			z = l;
			for (x = N - 1; x >= 0; x--) {
				result = result + CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x, y, z)));
			}
			result = result + separator;
			result = result + separator;
			result = result + linebreak;
		}

		return result;
	}

}




//Coordinates one more than Rubicks cube
//Colors Numbered like Faces
export class ColoredCube {

	constructor(readonly spec: CubeSpecification, readonly cubeCoordinates: Array<CubeCoordinates>, readonly colors: Array<number>) {
		if (cubeCoordinates.length != colors.length) throw 'Invalid inpur parameters';
		//ToDo more validate?
	}

	//If later picture instead of color: Rotate before "colors.push(cubeFace.index);" by orientation", same for fromString
	public static fromCubeState(cubeState: CubeState): ColoredCube {
		const colors: Array<number> = new Array<number>();
		const log: boolean = false;
		const logString: string = '';
		const cubeCoordinates: Array<CubeCoordinates> = new Array<CubeCoordinates>();
		for (const index = 0; index < CornerCubicalLocation.getIndexBound(cubeState.spec); index++) {
			const cubical: CornerCubical = cubeState.cornerCubicals[index];
			if (log) logString = logString + 'CornerCubical' + cubical.initiallocation.coordinates.toString() + ':';
			for (const d = 0; d < 3; d++) {
				const cubeFace: CubeFace = cubical.initiallocation.cubeCorner.neigbouringFaces[d];
				colors.push(cubeFace.index);
				cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
				if (log) logString += cubeFace.toString()
					+ '(' + cubeFace.getNormalVector().toString()
					+ '->' + cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString() + ')'
					+ '(' + cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
					+ '->' + cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)).toString() + ') ';
				if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) ' + logString);
			}
		}
		if (log) logString = logString + '\n';
		for (const index = 0; index < EdgeCubicalLocation.getIndexBound(cubeState.spec); index++) {
			const cubical: EdgeCubical = cubeState.edgeCubicals[index];
			if (log) logString = logString + 'EdgeCubical' + cubical.initiallocation.coordinates.toString() + ':';
			for (const d = 0; d < 2; d++) {
				const cubeFace: CubeFace = cubical.initiallocation.cubeEdge.neigbouringFaces[d];
				colors.push(cubeFace.index);
				cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
				if (log) logString += cubeFace.toString()
					+ '(' + cubeFace.getNormalVector().toString()
					+ '->' + cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString() + ')'
					+ '(' + cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
					+ '->' + cubical.location.coordinates.add(cubeFace.getNormalVector()).transformAroundZero(cubical.reorientation.matrix).toString() + ') ';
				if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) ' + logString);
			}
		}
		if (log) logString = logString + '\n';
		for (const index = 0; index < FaceCubicalLocation.getIndexBound(cubeState.spec); index++) {
			const cubical: FaceCubical = cubeState.faceCubicals[index];
			if (log) logString = logString + 'FaceCubical' + cubical.initiallocation.coordinates.toString() + ':';
			for (const d = 0; d < 1; d++) { //loop d=0 just for being parallel with EdgeCubical, CornerCubical
				const cubeFace: CubeFace = cubical.initiallocation.cubeFace.neigbouringFaces[d];
				colors.push(cubeFace.index);
				cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
				if (log) logString += cubeFace.toString()
					+ '(' + cubeFace.getNormalVector().toString()
					+ '->' + cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString() + ')'
					+ '(' + cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
					+ '->' + cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)).toString() + ') ';
				if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) ' + logString);
			}
		}
		if (log) logString = logString + '\n';
		if (log) console.log(logString);
		return new ColoredCube(cubeState.spec, cubeCoordinates, colors);
	}

	//CAREFUL: 
	//Several equal EdgeCubicals or FaceCubicals are not distinguished in ColoredCube, are just "invented" 
	//The orientations of FaceCubicals are not dishinguished in ColoredCube, are just "invented"
	public toCubeState(): CubeState {
		const cornerCubicals: Array<CornerCubical> = new Array<CornerCubical>();
		const edgeCubicals: Array<EdgeCubical> = new Array<EdgeCubical>();
		const faceCubicals: Array<FaceCubical> = new Array<FaceCubical>();
		const initiallocationIndexAlreadyFound: Array<boolean>;//to avoid finding several times the same initialLocation fot location in NxNxX FaceCubicals and EdgesCubicals

		//CORNER
		initiallocationIndexAlreadyFound = new Array<boolean>(); //SPECIAL FOR CORNER: disposable, because corners are unique,  just implelemted for parallelity
		for (const initiallocationIndex = 0; initiallocationIndex < CornerCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) { initiallocationIndexAlreadyFound.push(false); }
		for (const locationIndex = 0; locationIndex < CornerCubicalLocation.getIndexBound(this.spec); locationIndex++) {
			const location: CornerCubicalLocation = new CornerCubicalLocation(this.spec, locationIndex);
			//find colors at this location
			const cubicalColors = new Array<CubeFace>();
			for (const d = 0; d < 3; d++) {
				const cubeFace: CubeFace = location.cubeCorner.neigbouringFaces[d];
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			const locationNeighbouringFaces = location.getNeighbouringFaces(); //in order to match orientation later
			const initiallocation: CornerCubicalLocation;
			const rotation: number;
			const found = false;
			//TODO Implement this "search for rotation" uniformely for Corner, Edge, Face
			//and even better by computing with matrices ?
			searchC:
			for (const initiallocationIndex = 0; initiallocationIndex < CornerCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) {
				if (initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation = new CornerCubicalLocation(this.spec, initiallocationIndex);
				for (rotation = 0; rotation < 3; rotation++) {
					if ((cubicalColors[0].index == initiallocation.cubeCorner.neigbouringFaces[0].index)
						&& (cubicalColors[1].index == initiallocation.cubeCorner.neigbouringFaces[1].index)
						&& (cubicalColors[2].index == initiallocation.cubeCorner.neigbouringFaces[2].index)) {
						found = true;
						initiallocationIndexAlreadyFound[initiallocationIndex] = true;
						break searchC;
					}
					//Try different rotation
					cubicalColors = [cubicalColors[1], cubicalColors[2], cubicalColors[0]];
					locationNeighbouringFaces = [locationNeighbouringFaces[1], locationNeighbouringFaces[2], locationNeighbouringFaces[0]];
				}
			}
			if (!found) throw 'Not found cubical with color combination ' + cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()+cubicalColors[2].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			const reorientationMatrix = MatrixUtils.getTransitivityMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(), initiallocation.getNeighbouringFaces()[1].getNormalVector(), initiallocation.getNeighbouringFaces()[2].getNormalVector(), locationNeighbouringFaces[0].getNormalVector(), locationNeighbouringFaces[1].getNormalVector(), locationNeighbouringFaces[2].getNormalVector());;
			cornerCubicals.push(new CornerCubical(this.spec, initiallocation, location, new Reorientation(reorientationMatrix)));
		}
		//EDGE
		initiallocationIndexAlreadyFound = new Array<boolean>();
		for (const initiallocationIndex = 0; initiallocationIndex < EdgeCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) { initiallocationIndexAlreadyFound.push(false); }
		for (const locationIndex = 0; locationIndex < EdgeCubicalLocation.getIndexBound(this.spec); locationIndex++) {
			const location: EdgeCubicalLocation = new EdgeCubicalLocation(this.spec, locationIndex);
			//find colors at this location
			const cubicalColors = new Array<CubeFace>();
			for (const d = 0; d < 2; d++) {
				const cubeFace: CubeFace = location.cubeEdge.neigbouringFaces[d];
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			const locationNeighbouringFaces = location.getNeighbouringFaces(); //in order to match orientation later
			const initiallocation: EdgeCubicalLocation;
			const rotation: number;
			const found = false;
			searchE:
			for (const initiallocationIndex = 0; initiallocationIndex < EdgeCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) {
				if (initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation = new EdgeCubicalLocation(this.spec, initiallocationIndex);
				for (rotation = 0; rotation < 2; rotation++) {
					if ((cubicalColors[0].index == initiallocation.cubeEdge.neigbouringFaces[0].index)
						&& (cubicalColors[1].index == initiallocation.cubeEdge.neigbouringFaces[1].index)) {
						found = true;
						initiallocationIndexAlreadyFound[initiallocationIndex] = true;
						break searchE;
					}
					cubicalColors = [cubicalColors[1], cubicalColors[0]];
					locationNeighbouringFaces = [locationNeighbouringFaces[1], locationNeighbouringFaces[0]];

				}
			}
			if (!found) throw 'Not found cubical with color combination ' + cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			const reorientationMatrix = MatrixUtils.getTransitivityOrthogonalMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(), initiallocation.getNeighbouringFaces()[1].getNormalVector(), locationNeighbouringFaces[0].getNormalVector(), locationNeighbouringFaces[1].getNormalVector());;
			edgeCubicals.push(new EdgeCubical(this.spec, initiallocation, location, new Reorientation(reorientationMatrix)));
		}

		/////FACE
		initiallocationIndexAlreadyFound = new Array<boolean>();
		for (const initiallocationIndex = 0; initiallocationIndex < FaceCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) { initiallocationIndexAlreadyFound.push(false); }
		for (const locationIndex = 0; locationIndex < FaceCubicalLocation.getIndexBound(this.spec); locationIndex++) {
			const location: FaceCubicalLocation = new FaceCubicalLocation(this.spec, locationIndex);
			//find colors at this location
			const cubicalColors = new Array<CubeFace>();
			for (const d = 0; d < 1; d++) {
				//FACE SPECIAL const cubeFace:CubeFace=location.cubeFace.neigbouringFaces[d];
				const cubeFace: CubeFace = location.cubeFace;
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			const locationNeighbouringFaces = location.getNeighbouringFaces(); //SPECIAL FOR FACE no rotation necessary, otherwise in order to match orientation later
			const initiallocation: FaceCubicalLocation;
			const rotation: number;
			const found = false;
			searchF:
			for (const initiallocationIndex = 0; initiallocationIndex < FaceCubicalLocation.getIndexBound(this.spec); initiallocationIndex++) {
				if (initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation = new FaceCubicalLocation(this.spec, initiallocationIndex);
				for (rotation = 0; rotation < 1; rotation++) {
					if ((cubicalColors[0].index == initiallocation.cubeFace.neigbouringFaces[0].index)) {
						found = true;
						initiallocationIndexAlreadyFound[initiallocationIndex] = true;
						break searchF;
					}
					cubicalColors = [cubicalColors[0]];
					locationNeighbouringFaces = [locationNeighbouringFaces[0]];
				}
			}
			if (!found) throw 'Not found cubical with color combination ' + cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()+cubicalColors[2].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			const reorientationMatrix = MatrixUtils.getTransitivityGuessedOrthogonalMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(), locationNeighbouringFaces[0].getNormalVector());;
			faceCubicals.push(new FaceCubical(this.spec, initiallocation, location, new Reorientation(reorientationMatrix)));
		}
		return new CubeState(this.spec, cornerCubicals, edgeCubicals, faceCubicals);
		/////////////////
		////EDGE HAS MULTIPLE HITS in NxNxN Cube!!!
	}

	//TODO Could be improved by directly memorizing a 3dim Array -1...N
	public getColorAt(coordinates: CubeCoordinates): number {
		for (const i: number = 0; i < this.cubeCoordinates.length; i++) {
			if (deepEqual(this.cubeCoordinates[i], coordinates)) return this.colors[i];
		}
		throw new Error('Coordinate ' + coordinates.toString() + ' not found in ColorCobe');
		return null;
	}

	public toString() {
		return CubeStateLanguage.toString(this);
	}
}

*/