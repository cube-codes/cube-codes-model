import { CubeSpecification, CubeCoordinates, CubeDimension } from '../src/Cube/CubeGeometry';
import { CubePart, CubePartType } from '../src/Cube/CubePart';
import { Cubical, CubicalLocation } from '../src/Cube/Cubical';
import { CubeState} from '../src/Cube/CubeState';
import { Cube } from '../src/Cube/Cube';
import { ColorCubeLanguage } from '../src/Cube/CubeStateLanguage';
import { Matrices } from "../src/Utilities/Matrices";
//import deepEqual from "deep-equal";



test('Basic Test', () => {

	let spec = new CubeSpecification(4, true);	

	////////////////////////////
	// Geometry 

	//The second cubical on the edge UF. It has coordinate (2,0,0)
	let uf2:CubicalLocation=CubicalLocation.fromCubePartAndRemainingCoordinates(spec,CubePart.UF,[2]);
	expect(uf2.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(CubeState.indexFromLocation(spec,uf2)).toEqual(0 * (4 - 2) + 1);
	expect(CubeState.indexToLocation(spec, 0 * (4 - 2) + 1, CubePartType.EDGE).coordinates).toEqual(new CubeCoordinates(2,0,0));

	//More.....Corner, Face

	///////////////////////////
	//Spatial Rotation Cubical on Single Cubical

	let cube:Cube=new Cube(spec); //Here only to pass along as a reference
	let uf2cubical:Cubical=new Cubical(cube, uf2);
	expect(uf2cubical.initialLocation.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(uf2cubical.location.coordinates).toEqual(new CubeCoordinates(2,0,0));
	uf2cubical.rotate(CubeDimension.Y);
	expect(uf2cubical.initialLocation.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(uf2cubical.location.coordinates).toEqual(new CubeCoordinates(3,0,2));

	
	///////////////////////////
	//Reorientation
	
	//RotationAroundX
	let LDB_to_LFD=Matrices.getTransitivityMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0),new CubeCoordinates(0,0,1),new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0));
	expect(LDB_to_LFD.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let LFD_to_LUF=Matrices.getTransitivityMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0),new CubeCoordinates(1,0,0),new CubeCoordinates(0,-1,0),new CubeCoordinates(0,0,-1));
	expect(LFD_to_LUF.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let LD_to_LF=Matrices.getTransitivityOrthogonalMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0),new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1));
	expect(LD_to_LF.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let DB_to_FD=Matrices.getTransitivityOrthogonalMatrix(new CubeCoordinates(0,1,0),new CubeCoordinates(0,0,1),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0));
	expect(DB_to_FD.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	//OtherRotation
	let FD_to_RF=Matrices.getTransitivityOrthogonalMatrix(new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0),new CubeCoordinates(-1,0,0),new CubeCoordinates(0,0,-1));
	expect(FD_to_RF.toString()).toEqual('[[0, 0, 1], [-1, 0, 0], [0, -1, 0]]'); 
	//FaceCubical
	let L_D=Matrices.getTransitivityGuessedOrthogonalMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0));
	expect(L_D.toString()).toEqual('[[0, 1, 0], [1, 0, 0], [0, 0, -1]]'); 

	 
	///////////////////////////
	// Rotation Cube
	
	cube.rotateSlice(CubeDimension.X,0);
	//console.log(cube.toFormattedString());
	expect(cube.getCubicalFrom(new CubeCoordinates(0,3,0)).location.coordinates).toEqual(new CubeCoordinates(0,0,0));
	expect(cube.getCubicalFrom(new CubeCoordinates(0,1,0)).location.coordinates).toEqual(new CubeCoordinates(0,0,2));

	
	//////////////////////////
	// CubeState: Test if encoding give right result, and if decoding again gives the same as initially

	let state:CubeState=cube.getState();
	//console.log(state.toFormattedString());
	expect(state.permutations[1]).toEqual([0,1,12,13,4,5,6,7,8,9,3,2,19,18,14,15,16,17,10,11,20,21,22,23]);  //(2 12 19 11)(3 13 18 10)
	expect(state.reorientations[1]).toEqual([0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0]);
	expect(state.reorientations[2]).toEqual([0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
	
	let cube2:Cube=new Cube(spec);
	cube2.setState(state);
	//console.log(cube2.toFormattedString());
	expect(cube.toFormattedString()).toEqual(cube2.toFormattedString());

	////////////////////////////////////////////
	//Import Export to ColorCube
	

	let lang=new ColorCubeLanguage(spec);
	let colorString=
		'        U U U U                 \n'+
		'        U U U U                 \n'+
		'        U U U U                 \n'+
		'        U U U U                 \n'+
		'B B B B L L L L F F F F R R R R \n'+
		'L L L L F F F F R R R R B B B B \n'+
		'L L L L F F F F R R R R B B B B \n'+
		'L L L L F F F F R R R R B B B B \n'+
		'        D D D D                 \n'+
		'        D D D D                 \n'+
		'        D D D D                 \n'+
		'        D D D D                 \n';
	//console.log(colorString);	
	let importedCubeState:CubeState=lang.parse(colorString);
	//console.log(importedCubeState.toFormattedString());
	expect(importedCubeState.permutations[0]).toEqual([0,1,3,5,2,4,6,7]); //DRF DBR URB UBL UFR ULF DLB DFL // (UFR, URB, UBL, ULF) 
	//TODO Test and understand orientations better

	let reexportedColorString=lang.stringify(importedCubeState)
	//console.log(reexportedColorString);
	expect(reexportedColorString).toEqual(colorString);


});