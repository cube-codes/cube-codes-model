import { e, matrix , multiply } from 'mathjs'

import { Cube, CubeStateLanguage,CubeSpecification, CubeMove, ColoredCube, CubeFace, EdgeCubical,EdgeCubicalLocation, CubeCoordinates, CubeDimension, CubeAngle, CubeEdge, CubeState, Rotation } from "../src/Cube"
import { Permutation } from "../src/Permutation";
import { CubeMoveLanguage } from '../src/CubeMoveLanguage';

test('Basic Test', () => {

	let spec = new CubeSpecification(4);	

	////////////////////////////
	// Geometry 

	let uf2:EdgeCubicalLocation=EdgeCubicalLocation.fromEdgeAndCoordinate(spec,CubeEdge.UF,2);
	expect(uf2.index).toEqual(0* (4 - 2) + 1);
	expect(uf2.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(EdgeCubicalLocation.fromCoordinates(spec,new CubeCoordinates(2,0,0)).index).toEqual(uf2.index);

	/*
	new EdgeCubicle(spec, CubeEdgeIndex.UF * (4 - 2) + 1); 
	expect(d1.edge.dimension).toEqual(CubeDimension.X);
	expect(d1.edge.coordinates).toEqual(new CubeCoordinates(0,0,0));
	expect(d1.coordinates).toEqual(new CubeCoordinates(2,0,0));
	let d11=EdgeCubicle.fromCoordinates(spec,new CubeCoordinates(2,0,0));
	expect(d11.index).toEqual(CubeEdgeIndex.UF  * (4 - 2) + 1);

	let d2 = new EdgeCubicle(spec,  CubeEdgeIndex.UR* (4 - 2) + 0); 
	expect(d2.edge.dimension).toEqual(CubeDimension.Z);
	expect(d2.edge.coordinates).toEqual(new CubeCoordinates(0,0,0));
	expect(d2.coordinates).toEqual(new CubeCoordinates(0,0,1));
	let d22=EdgeCubicle.fromCoordinates(spec,new CubeCoordinates(0,0,1));
	expect(d22.index).toEqual(CubeEdgeIndex.UR  * (4 - 2) + 0);
	
	let d3 = new EdgeCubicle(spec,  CubeEdgeIndex.BU* (4 - 2) + 1); 
	expect(d3.edge.dimension).toEqual(CubeDimension.X);
	expect(d3.edge.coordinates).toEqual(new CubeCoordinates(0,0,4-1));
	expect(d3.coordinates).toEqual(new CubeCoordinates(2,0,4-1));
	let d33=EdgeCubicle.fromCoordinates(spec,new CubeCoordinates(2,0,4-1));
	expect(d33.index).toEqual(CubeEdgeIndex.BU  * (4 - 2) + 1); */
	
	//More.....Corner, Face

	///////////////////////////
	//Spatial Rotation Cubical

	let uf2cubical:EdgeCubical=EdgeCubical.fromInitialLocation(uf2);
	expect(uf2cubical.initiallocation.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(uf2cubical.location.coordinates).toEqual(new CubeCoordinates(2,0,0));
	uf2cubical=uf2cubical.move(CubeDimension.Y);
	expect(uf2cubical.initiallocation.coordinates).toEqual(new CubeCoordinates(2,0,0));
	expect(uf2cubical.location.coordinates).toEqual(new CubeCoordinates(3,0,2));
	
	///////////////////////////
	//Reorientation
	
	//RotationAroundX
	let LDB_to_LFD=Rotation.getTransitivityMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0),new CubeCoordinates(0,0,1),new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0));
	expect(LDB_to_LFD.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let LFD_to_LUF=Rotation.getTransitivityMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0),new CubeCoordinates(1,0,0),new CubeCoordinates(0,-1,0),new CubeCoordinates(0,0,-1));
	expect(LDB_to_LFD.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let LD_to_LF=Rotation.getTransitivityOrthogonalMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0),new CubeCoordinates(1,0,0),new CubeCoordinates(0,0,-1));
	expect(LD_to_LF.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	let DB_to_FD=Rotation.getTransitivityOrthogonalMatrix(new CubeCoordinates(0,1,0),new CubeCoordinates(0,0,1),new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0));
	expect(LD_to_LF.toString()).toEqual('[[1, 0, 0], [0, 0, 1], [0, -1, 0]]'); 
	//OtherRotation
	let FD_to_RF=Rotation.getTransitivityOrthogonalMatrix(new CubeCoordinates(0,0,-1),new CubeCoordinates(0,1,0),new CubeCoordinates(-1,0,0),new CubeCoordinates(0,0,-1));
	expect(FD_to_RF.toString()).toEqual('[[0, 0, 1], [-1, 0, 0], [0, -1, 0]]'); 
	//FaceCubical
	let L_D=Rotation.getTransitivityGuessedOrthogonalMatrix(new CubeCoordinates(1,0,0),new CubeCoordinates(0,1,0));
	expect(L_D.toString()).toEqual('[[0, 1, 0], [1, 0, 0], [0, 0, -1]]'); 

	///////////////////////////
	// Rotation Cube
	let cubeState=CubeState.fromSolved(spec);
	/*for(let edgeIndex=0;edgeIndex<EdgeCubicalLocation.getIndexBound(spec);edgeIndex++) {
		console.log(cubeState.edgeCubicals[edgeIndex].initiallocation.coordinates.toString()
		+' -> '+cubeState.edgeCubicals[edgeIndex].location.coordinates.toString());
	}*/
	let cubeState1=cubeState.moveSlice(CubeDimension.X,0);
	expect(cubeState1.getEdgePermutation()).toEqual([0,1,12,13,4,5,6,7,8,9,3,2,19,18,14,15,16,17,10,11,20,21,22,23]);  //(2 12 19 11)(3 13 18 10)
	let cubeState2=cubeState.moveSlice(CubeDimension.X,1);
	expect(cubeState2.getEdgePermutation()).toEqual([4,1,2,3,20,5,6,7,8,9,10,11,12,13,14,15,0,17,18,19,16,21,22,23]); // (0 4 20 16)()

	//corners etc.

	////////////////////////////////////////////
	//Import Export
	cubeState=CubeState.fromSolved(spec);
	//console.log(cubeState.toString());
	cubeState=cubeState.moveSlice(CubeDimension.X,0);
	cubeState=cubeState.move(new CubeMove(spec,CubeFace.DOWN.index,2,CubeAngle.CC90));
	//console.log(cubeState.toString());

	let lang=new CubeStateLanguage(spec);
	let coloredCube=ColoredCube.fromCubeState(cubeState);
	let stringified:string=lang.toString(coloredCube);
	// String -> ColoredCube -> String
	expect(lang.fromString(stringified).toString()).toEqual(stringified); 
	// ColoredCube -> CubeState -> ColoredCube
	expect(ColoredCube.fromCubeState(coloredCube.toCubeState()).toString()).toEqual(coloredCube.toString());
	// BUT NOT CubeState -> ColoredCube -> CubeState
	cubeState2=coloredCube.toCubeState();
	expect(cubeState2.getCornerPermutation()).toEqual(cubeState.getCornerPermutation());
	expect(cubeState2.getEdgePermutation()).toEqual([
		0,  1, 11, 12,  4,  5,  6,  7,
		8, 15,  2,  3, 16, 17, 13, 14,
	   22, 23,  9, 10, 18, 19, 20, 21
	 ]); //NOT the same as initial (eg edge 11 12 ordered) due to the non-unique edge- and face cubicals
	 expect(cubeState2.getFacePermutation()).toEqual([
		0,2,18,19,
		1,3,4,5,
		8,9,10,11,
		6,7,12,14,
		13,15,16,17,
		20,21,22,23]);
	//console.log(cubeState2.toString());
		

});