import { matrix, Matrix, identity, multiply,inv, number, getMatrixDataTypeDependencies, log, string, ResultSetDependencies  } from 'mathjs'

import { EventData, Event } from "./Event"
import { CubeMoveLanguage } from "./CubeMoveLanguage";
import { Permutation } from "./Permutation";

var deepEqual = require('deep-equal')

export class CubeSpecification {
	constructor(
		readonly edgeLength: number) {
		if (!Number.isInteger(edgeLength) || edgeLength < 2 || edgeLength > 8) throw 'Invalid edge length';
	}
}

export enum CubeDimension {
	X = 0, // R -> L
	Y = 1, // U -> D
	Z = 2  // F -> B
}

export class CubeCoordinates {

	constructor(readonly x: number,
		readonly y: number,
		readonly z: number) { }
		
	static fromDimension(dimension: CubeDimension, value: number) {
		switch (dimension) {
			case CubeDimension.X:
				return new CubeCoordinates(value, 0, 0);
			case CubeDimension.Y:
				return new CubeCoordinates(0, value, 0);
			case CubeDimension.Z:
				return new CubeCoordinates(0, 0, value);
			default:
				throw 'Unknown dimension from'+value.toString();
		}
	}
	getComponent(dimension: CubeDimension) {
		switch (dimension) {
			case CubeDimension.X:
				return this.x;
			case CubeDimension.Y:
				return this.y;
			case CubeDimension.Z:
				return this.z;
			default:
				throw new Error('Unknown dimension get');
		}
	}
	add(summand: CubeCoordinates) {
		return new CubeCoordinates(this.x + summand.x, this.y + summand.y, this.z + summand.z);
	}
	addAt(dimension:CubeDimension, summand:number) {
		return this.withValue(dimension,this.getComponent(dimension)+summand);
	}
	substract(subtrahend: CubeCoordinates) {
		return new CubeCoordinates(this.x - subtrahend.x, this.y - subtrahend.y, this.z - subtrahend.z);
	}
	multiply(factor: number) {
		return new CubeCoordinates(this.x * factor, this.y * factor, this.z * factor);
	}
	divide(factor: number) {
		return new CubeCoordinates(this.x / factor, this.y / factor, this.z / factor);
	}
	withValue(dimension: CubeDimension, value: number) {
		switch (dimension) {
			case CubeDimension.X:
				return new CubeCoordinates(value, this.y, this.z);
			case CubeDimension.Y:
				return new CubeCoordinates(this.x, value, this.z);
			case CubeDimension.Z:
				return new CubeCoordinates(this.x, this.y, value);
			default:
				throw 'Unknonwn dimension';
		}
	}

	public toString() : String {
		return "("+(new String(this.x))+","+(new String(this.y))+","+(new String(this.z))+")";
	}

	public transformAroundCenter(spec:CubeSpecification,transformation:Matrix):CubeCoordinates {
		let shift:number=(spec.edgeLength-1)/2;
		let v:Matrix = matrix([[this.x-shift],[this.y-shift],[this.z-shift]]);
		v=multiply(transformation,v);
		let result=new CubeCoordinates(v.get([0,0])+shift,v.get([1,0])+shift,v.get([2,0])+shift)
		return result;
	}

	public transformAroundZero(transformation:Matrix):CubeCoordinates {
		let v:Matrix = matrix([[this.x],[this.y],[this.z]]);
		v=multiply(transformation,v);
		let result=new CubeCoordinates(v.get([0,0]),v.get([1,0]),v.get([2,0]))
		return result;
	}

	public move(spec:CubeSpecification,dimension:CubeDimension):CubeCoordinates {
		return this.transformAroundCenter(spec,Rotation.getAxisRotation(dimension));
	}
}


export class Reorientation {
	constructor(
		readonly  matrix:Matrix) {
	}

	public static fromTrivial() {
		let e : Matrix = matrix([[1,0,0], [0,1,0], [0,0,1]]);
		return new Reorientation(e);  
	}

	
	public move(dimension:CubeDimension) : Reorientation {
		return new Reorientation(multiply(Rotation.getAxisRotation(dimension),this.matrix));
	}
}

//Main Class
export class Rotation {
	public static getAxisRotation(dimension:CubeDimension):Matrix {
		switch(dimension) {
			case CubeDimension.X: return matrix([[1,0,0], [0,0,1], [0,-1,0]]);
			case CubeDimension.Y: return matrix([[0,0,-1], [0,1,0], [1,0,0]]);
			case CubeDimension.Z: return matrix([[0,1,0], [-1,0,0], [0,0,1]]);
		}
	}

	public static getFromColumns(col1:CubeCoordinates,col2:CubeCoordinates,col3:CubeCoordinates):Matrix {
		return matrix([[col1.x,col2.x,col3.x], [col1.y,col2.y,col3.y], [col1.z,col2.z,col3.z]]);
	}

	public static getCrossedProduct(v:CubeCoordinates,w:CubeCoordinates):CubeCoordinates {
		return new CubeCoordinates(v.y*w.z-v.z*w.y,-v.x*w.z+v.z*w.x,v.x*w.y-v.y*w.x);
	}

	public static getTransitivityMatrix(from1:CubeCoordinates,from2:CubeCoordinates,from3:CubeCoordinates,to1:CubeCoordinates,to2:CubeCoordinates,to3:CubeCoordinates):Matrix {
		return multiply(Rotation.getFromColumns(to1,to2,to3),inv(Rotation.getFromColumns(from1,from2,from3)));
	}

	public static getTransitivityOrthogonalMatrix(from1:CubeCoordinates,from2:CubeCoordinates,to1:CubeCoordinates,to2:CubeCoordinates):Matrix {
		let from3:CubeCoordinates=Rotation.getCrossedProduct(from1,from2);
		let to3:CubeCoordinates=Rotation.getCrossedProduct(to1,to2);
		return Rotation.getTransitivityMatrix(from1,from2,from3,to1,to2,to3);
	}

	private static guessLinearlyIndependentAxisDirectionToAxisDirection(v:CubeCoordinates):CubeCoordinates {
		if (v.x==0) return new CubeCoordinates(1,0,0);
		if (v.y==0) return new CubeCoordinates(0,1,0);
		if (v.y==0) return new CubeCoordinates(0,0,1);
		throw new Error('Was not an Axis Direction');
	}

	public static getTransitivityGuessedOrthogonalMatrix(from1:CubeCoordinates,to1:CubeCoordinates) {
		//guess linearly independent direction
		let from2=Rotation.guessLinearlyIndependentAxisDirectionToAxisDirection(from1);
		let to2=Rotation.guessLinearlyIndependentAxisDirectionToAxisDirection(to1);
		return Rotation.getTransitivityOrthogonalMatrix(from1,from2,to1,to2);
	}
}


//TODO Better an interface, but then must again upcast outputs to CubeCorner,CubeEdge,CubeFace....
export abstract class Location {
	public abstract getNeighbouringFaces():Array<CubeFace>;
	public abstract getCoordinates();

	constructor(readonly spec:CubeSpecification) {
	}
}


export class Cubical {
	constructor(
		readonly spec: CubeSpecification,
		readonly location: Location,
		readonly reorientation: Reorientation) {
	}
}

export class CornerCubicalLocation extends Location {	

	public cubeCorner:CubeCorner;
	public coordinates:CubeCoordinates;

	constructor(readonly spec: CubeSpecification, readonly index:number) {
		super(spec);
		if(index<0 || index >=CornerCubicalLocation.getIndexBound(spec)) throw 'Index out of bounds';
		this.cubeCorner=CubeCorner.fromIndex(index);
		this.coordinates=this.cubeCorner.coordinates.multiply(spec.edgeLength-1);
	}
	
	//TODO CubeCorner etc should have some common subclass
	public getNeighbouringFaces():Array<CubeFace> {
		return this.cubeCorner.getNeigbouringFaces();
	}

	public getCoordinates():CubeCoordinates {
		return this.coordinates;
	}

	static getIndexBound(spec: CubeSpecification) {
		return 8;
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates):CornerCubicalLocation {
		return new CornerCubicalLocation(spec,CubeCorner.fromCoordinates(coordinates.divide(spec.edgeLength-1)).index);
	}

	static fromCorner(spec: CubeSpecification,cubeCorner:CubeCorner) {
		return new CornerCubicalLocation(spec,cubeCorner.index);
	}

	public static toStringTable(spec: CubeSpecification) : String {
		let result='';
		
		for (let index=0;index<CornerCubicalLocation.getIndexBound(spec);index++) {
			result=result+(new String(index))+'='+(new CornerCubicalLocation(spec,index)).coordinates.toString()+' ';
		}
		return result;
	}
}

export class CornerCubical extends Cubical {
	constructor(
		readonly spec: CubeSpecification,
		readonly initiallocation: CornerCubicalLocation,
		readonly location: CornerCubicalLocation,
		readonly reorientation: Reorientation) {
		super(spec,location, reorientation);
	}

	static fromInitialLocation(location:CornerCubicalLocation) : CornerCubical {
		return new CornerCubical(location.spec, location,location, Reorientation.fromTrivial());
	}

	public move(dimension:CubeDimension):CornerCubical {
	return new CornerCubical(
		this.spec,
		this.initiallocation,
		CornerCubicalLocation.fromCoordinates(this.spec,this.location.coordinates.move(this.spec,dimension)),
		this.reorientation.move(dimension));
	}
}

export class EdgeCubicalLocation extends Location {
	
	public coordinates:CubeCoordinates;
	
	public cubeEdge:CubeEdge;
	public lastCoordinate:number;
	
	constructor(readonly spec: CubeSpecification, readonly index:number) {
		super(spec);
		if(index<0 || index>=EdgeCubicalLocation.getIndexBound(spec)) throw 'Index out of bounds';
		this.cubeEdge=CubeEdge.fromIndex(Math.floor(index / (spec.edgeLength - 2)));
		this.lastCoordinate= (index % (spec.edgeLength - 2))+1;
		this.coordinates=this.cubeEdge.coordinates.multiply(spec.edgeLength-1).add(CubeCoordinates.fromDimension(this.cubeEdge.dimension, this.lastCoordinate));
	
	}

	//TODO CubeCorner etc should have some common subclass
	public getNeighbouringFaces():Array<CubeFace> {
		return this.cubeEdge.getNeigbouringFaces();
	}

	public getCoordinates():CubeCoordinates {
		return this.coordinates;
	}

	static getIndexBound(spec: CubeSpecification) {
		return 12*(spec.edgeLength - 2);
	}

	static fromEdgeAndCoordinate(spec: CubeSpecification,cubeEdge:CubeEdge,lastCoordinate:number):EdgeCubicalLocation {
		return new EdgeCubicalLocation(spec,cubeEdge.index * (spec.edgeLength - 2) + (lastCoordinate-1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates):EdgeCubicalLocation {
		//console.log(coordinates.toString());
		let dimension: CubeDimension = null;
		let lastCoordinate: number = null;
		let edgeCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension = CubeDimension.X;
			lastCoordinate = coordinates.x;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension !== null) throw 'Coordinate of MidCubicle or inside cube';
			dimension = CubeDimension.Y;
			lastCoordinate = coordinates.y;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Y, 0);
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension !== null) throw 'Coordinate of MidCubicle or inside cube';
			dimension = CubeDimension.Z;
			lastCoordinate = coordinates.z;
			edgeCoordinates = edgeCoordinates.withValue(CubeDimension.Z, 0);
		}
		if (dimension === null) throw 'Coordinate of CornerCubicle';
		let cubeEdge = CubeEdge.fromCoordinates(dimension, edgeCoordinates.divide(spec.edgeLength-1));
		//console.log(cubeEdge.index);
		//console.log(lastCoordinate);
		return EdgeCubicalLocation.fromEdgeAndCoordinate(spec,cubeEdge,lastCoordinate);
	}

	public static toStringTable(spec: CubeSpecification) : String {
		let result='';
		
		for (let index=0;index<EdgeCubicalLocation.getIndexBound(spec);index++) {
			result=result+(new String(index))+'='+(new EdgeCubicalLocation(spec,index)).coordinates.toString()+' ';
		}
		return result;
	}
}


export class EdgeCubical extends Cubical {
	constructor(
		readonly spec: CubeSpecification,
		readonly initiallocation: EdgeCubicalLocation,
		readonly location: EdgeCubicalLocation,
		readonly reorientation: Reorientation) {
		super(spec,location, reorientation);
	}

	static fromInitialLocation(location:EdgeCubicalLocation) : EdgeCubical {
		return new EdgeCubical(location.spec, location,location,	Reorientation.fromTrivial());
	}
	
	public move(dimension:CubeDimension):EdgeCubical {
		return new EdgeCubical(
			this.spec,
			this.initiallocation,
			EdgeCubicalLocation.fromCoordinates(this.spec,this.location.coordinates.move(this.spec,dimension)),
			this.reorientation.move(dimension));
		}
}

export class FaceCubicalLocation extends Location {
	
	public coordinates:CubeCoordinates;
	

	public cubeFace:CubeFace;
	public coordinate1:number;
	public coordinate2:number;
	
	constructor(readonly spec: CubeSpecification, readonly index:number) {
		super(spec);
		if(index<0 || index>= FaceCubicalLocation.getIndexBound(spec)) throw 'Index out of bounds';
		this.cubeFace=CubeFace.fromIndex(Math.floor(index / ((spec.edgeLength - 2)*(spec.edgeLength - 2))));
		let twoCoordinates = (index % ((spec.edgeLength - 2)*(spec.edgeLength - 2)));
		this.coordinate1 = Math.floor(twoCoordinates /(spec.edgeLength - 2))+1;
		this.coordinate2= (twoCoordinates % (spec.edgeLength - 2))+1;
		this.coordinates=this.cubeFace.coordinates.multiply(spec.edgeLength-1).add(CubeCoordinates.fromDimension(this.cubeFace.dimension1, this.coordinate1)).add(CubeCoordinates.fromDimension(this.cubeFace.dimension2, this.coordinate2));
	}

	
	//TODO CubeCorner etc should have some common subclass
	public getNeighbouringFaces():Array<CubeFace> {
		return this.cubeFace.getNeigbouringFaces();
	}
	
	public getCoordinates():CubeCoordinates {
		return this.coordinates;
	}

	static getIndexBound(spec: CubeSpecification) {
		return 6*(spec.edgeLength - 2)*(spec.edgeLength - 2)
	}

	static fromFaceAndCoordinate(spec: CubeSpecification,cubeFace:CubeFace,coordinate1:number,coordinate2:number) {
		return new FaceCubicalLocation(spec,cubeFace.index*(spec.edgeLength - 2) * (spec.edgeLength - 2) + (coordinate1-1)*(spec.edgeLength - 2)+(coordinate2-1));
	}

	static fromCoordinates(spec: CubeSpecification, coordinates: CubeCoordinates) {
		let dimension1: CubeDimension = null;
		let dimension2: CubeDimension = null;
		let coordinate1: number = null;
		let coordinate2: number = null;
		let faceCoordinates = coordinates;
		if (coordinates.x < 0 || coordinates.x > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.x > 0 && coordinates.x < spec.edgeLength - 1) {
			dimension1 = CubeDimension.X;
			coordinate1 = coordinates.x;
			faceCoordinates = faceCoordinates.withValue(CubeDimension.X, 0);
		}
		if (coordinates.y < 0 || coordinates.y > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.y > 0 && coordinates.y < spec.edgeLength - 1) {
			if (dimension1 !== null) {
				dimension2 = CubeDimension.Y;
				coordinate2=coordinates.y;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Y, 0);
			} else {
				dimension1 = CubeDimension.Y;
				coordinate1=coordinates.y;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Y, 0);
			}
		}
		if (coordinates.z < 0 || coordinates.z > spec.edgeLength - 1) throw 'Coordinate outside of cube';
		if (coordinates.z > 0 && coordinates.z < spec.edgeLength - 1) {
			if (dimension2 !== null) throw 'Coordinate  inside cube';
			if (dimension1 !== null) {
				dimension2 = CubeDimension.Z;
				coordinate2=coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			} else {
				dimension1 = CubeDimension.Z;
				coordinate1=coordinates.z;
				faceCoordinates = faceCoordinates.withValue(CubeDimension.Z, 0);
			}
		}
		if (dimension2 === null) throw 'Coordinate of CornerCubicle or EdgeCubical';
		let cubeFace = CubeFace.fromCoordinates(dimension1, dimension2, faceCoordinates.divide(spec.edgeLength-1));
		return FaceCubicalLocation.fromFaceAndCoordinate(spec,cubeFace,coordinate1,coordinate2);
	}

		
	public static toStringTable(spec: CubeSpecification) : String {
		let result='';
		
		for (let index=0;index<FaceCubicalLocation.getIndexBound(spec);index++) {
			result=result+(new String(index))+'='+(new FaceCubicalLocation(spec,index)).coordinates.toString()+' ';
		}
		return result;
	}
}

export class FaceCubical extends Cubical {
	constructor(
		readonly spec: CubeSpecification,
		readonly initiallocation: FaceCubicalLocation,
		readonly location: FaceCubicalLocation,
		readonly reorientation: Reorientation) {
		super(spec,location, reorientation);
	}

	static fromInitialLocation(location:FaceCubicalLocation) : FaceCubical {
		return new FaceCubical(location.spec,location,location,Reorientation.fromTrivial());
	}
	
	public move(dimension:CubeDimension):FaceCubical {
		return new FaceCubical(
			this.spec,
			this.initiallocation,
			FaceCubicalLocation.fromCoordinates(this.spec,this.location.coordinates.move(this.spec,dimension)),
			this.reorientation.move(dimension));
		}

}



export class CubeState {
	constructor(
		readonly spec: CubeSpecification,
		readonly cornerCubicals: Array<CornerCubical>,
		readonly edgeCubicals: Array<EdgeCubical>,
		readonly faceCubicals: Array<FaceCubical>
		) {
	}
	//Doppelt gemoppelt - der Index ist auch noch gleich initialLocation
	static fromSolved(spec: CubeSpecification):CubeState{
		let cornerCubicals: Array<CornerCubical>=new Array<CornerCubical>();
		let edgeCubicals: Array<EdgeCubical>=new Array<EdgeCubical>();
		let faceCubicals: Array<FaceCubical>=new Array<FaceCubical>();
		for(let cornerCubicalIndex=0;cornerCubicalIndex < CornerCubicalLocation.getIndexBound(spec); cornerCubicalIndex++) {
			let location=new CornerCubicalLocation(spec,cornerCubicalIndex);
			cornerCubicals[cornerCubicalIndex]=CornerCubical.fromInitialLocation(location);
		}
		for(let edgeCubicalIndex=0;edgeCubicalIndex < EdgeCubicalLocation.getIndexBound(spec); edgeCubicalIndex++) {
			let location=new EdgeCubicalLocation(spec,edgeCubicalIndex);
			edgeCubicals[edgeCubicalIndex]=EdgeCubical.fromInitialLocation(location);
		}
		for(let faceCubicalIndex=0;faceCubicalIndex < FaceCubicalLocation.getIndexBound(spec); faceCubicalIndex++) {
			let location=new FaceCubicalLocation(spec,faceCubicalIndex);
			faceCubicals[faceCubicalIndex]=FaceCubical.fromInitialLocation(location);
		}
		return new CubeState(spec, cornerCubicals,edgeCubicals,faceCubicals);
	}

	moveParse(movesString:string) {
		let result:CubeState=this;
		(new CubeMoveLanguage(this.spec)).parse(movesString).forEach(function (move) {
			result=result.move(move);
		});
		return result;
	}

	move(move: CubeMove):CubeState {
		let face=CubeFace.fromIndex(move.face);
		let dimension=face.getOrthogonalDimension();
		let angle=move.angle;
		let firstSliceCoordinate=0;
		let lastSliceCoordinate=move.slices-1;
		if (face.isBackside()) {
			angle=-move.angle;
			firstSliceCoordinate=this.spec.edgeLength-move.slices;
			lastSliceCoordinate=this.spec.edgeLength-1;
		}
		if (angle<0) angle=angle+4; //make it positive;

		let result:CubeState=this;
		for (let sliceCoordinate=firstSliceCoordinate;sliceCoordinate<=lastSliceCoordinate;sliceCoordinate++) {
			for (let counter=0;counter<angle;counter++) {
				result=result.moveSlice(dimension, sliceCoordinate);
			}
		}		
		return result;
	}
	public  moveSlice(dimension:CubeDimension, sliceCoordinate:number):CubeState {
		let newCornerCubicals: Array<CornerCubical>=new Array<CornerCubical>();
		let newEdgeCubicals: Array<EdgeCubical>=new Array<EdgeCubical>();
		let newFaceCubicals: Array<FaceCubical>=new Array<FaceCubical>();
		//could be combined into one iterator over all cubicals
		for(let cornerCubicalIndex=0;cornerCubicalIndex<CornerCubicalLocation.getIndexBound(this.spec);cornerCubicalIndex++) {
			if(sliceCoordinate==this.cornerCubicals[cornerCubicalIndex].location.coordinates.getComponent(dimension)) {
				newCornerCubicals[cornerCubicalIndex]=this.cornerCubicals[cornerCubicalIndex].move(dimension);
			} else {
				newCornerCubicals[cornerCubicalIndex]=this.cornerCubicals[cornerCubicalIndex]
			}
		}
		for(let edgeCubicalIndex=0;edgeCubicalIndex<EdgeCubicalLocation.getIndexBound(this.spec);edgeCubicalIndex++) {
			if(sliceCoordinate==this.edgeCubicals[edgeCubicalIndex].location.coordinates.getComponent(dimension)) {
				newEdgeCubicals[edgeCubicalIndex]=this.edgeCubicals[edgeCubicalIndex].move(dimension);
				//console.log(this.edgeCubicals[edgeCubicalIndex].location.coordinates.toString()+' -> '+newEdgeCubicals[edgeCubicalIndex].location.coordinates.toString()); }
			} else {
				newEdgeCubicals[edgeCubicalIndex]=this.edgeCubicals[edgeCubicalIndex];
			}
		}
		for(let faceCubicalIndex=0;faceCubicalIndex<FaceCubicalLocation.getIndexBound(this.spec);faceCubicalIndex++) {
			if(sliceCoordinate==this.faceCubicals[faceCubicalIndex].location.coordinates.getComponent(dimension)) {
				newFaceCubicals[faceCubicalIndex]=this.faceCubicals[faceCubicalIndex].move(dimension);
			} else { 
				newFaceCubicals[faceCubicalIndex]=this.faceCubicals[faceCubicalIndex];
			}
		}
		return new CubeState(this.spec,newCornerCubicals,newEdgeCubicals, newFaceCubicals);
	}

	public getCornerPermutation():Array<number> {
		let result:Array<number>=new Array<number>();
		for(let index=0;index<CornerCubicalLocation.getIndexBound(this.spec);index++) {
			result[this.cornerCubicals[index].initiallocation.index]=	this.cornerCubicals[index].location.index	
		}
		return result;
	}
	public getEdgePermutation():Array<number> {
		let result:Array<number>=new Array<number>();
		for(let index=0;index<EdgeCubicalLocation.getIndexBound(this.spec);index++) {
			result[this.edgeCubicals[index].initiallocation.index]=	this.edgeCubicals[index].location.index	
		}
		return result;
	}
	public getFacePermutation():Array<number> {
		let result:Array<number>=new Array<number>();
		for(let index=0;index<FaceCubicalLocation.getIndexBound(this.spec);index++) {
			result[this.faceCubicals[index].initiallocation.index]=	this.faceCubicals[index].location.index	
		}
		return result;
	}

	public shuffleByMove() : CubeState 
	{
		let times=100;
		let result:CubeState=this;
		for(let i=0;i<times;i++) {
			let dimension:CubeDimension=Math.floor(Math.random() * 3);
			let slice:number=Math.floor(Math.random() * this.spec.edgeLength);
			result=result.moveSlice(dimension,slice);
		}
		return result;
	}

	public shiffleByExplosion() : CubeState {
		throw 'Not yet implemented (orientation somewhat tricky)'
	}

	public toString():string {
		return ColoredCube.fromCubeState(this).toString();
	}
	public toPermutationString():string {
		return	'Corner Permutations: ['+ this.getCornerPermutation().toString()+"] \n"+
				'Edge   Permutations: ['+ this.getEdgePermutation().toString()+"] \n"+
				'Face   Permutations: ['+ this.getFacePermutation().toString()+"] \n";
	}
}

//Coordinates one more than Rubicks cube
//Colors Numbered like Faces
export class ColoredCube {
	
	constructor(readonly spec:CubeSpecification,readonly cubeCoordinates:Array<CubeCoordinates>, readonly colors:Array<number>) {
		if(cubeCoordinates.length!=colors.length) throw  'Invalid inpur parameters';
		//ToDo more validate?
	}

	//If later picture instead of color: Rotate before "colors.push(cubeFace.index);" by orientation", same for fromString
	public static fromCubeState(cubeState:CubeState):ColoredCube {
		let colors:Array<number>=new Array<number>();
		let log:boolean=false;
		let logString:string='';
		let cubeCoordinates:Array<CubeCoordinates>=new Array<CubeCoordinates>();
		for(let index=0;index<CornerCubicalLocation.getIndexBound(cubeState.spec);index++) {
			let cubical:CornerCubical=cubeState.cornerCubicals[index];
			if (log) logString=logString+'CornerCubical'+cubical.initiallocation.coordinates.toString()+':';
			for(let d=0;d<3;d++) {
				let cubeFace:CubeFace=cubical.initiallocation.cubeCorner.getNeigbouringFaces()[d];
				colors.push(cubeFace.index);
				cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
				if (log) logString+=cubeFace.toString()
					+'('+cubeFace.getNormalVector().toString()
					+'->'+cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString()+')'
					+'('+cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
					+'->'+cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)).toString()+') ';	
				if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) '+logString);
			}
		}
		if (log) logString=logString+'\n';
		for(let index=0;index<EdgeCubicalLocation.getIndexBound(cubeState.spec);index++) {
			let cubical:EdgeCubical=cubeState.edgeCubicals[index];
			if (log) logString=logString+'EdgeCubical'+cubical.initiallocation.coordinates.toString()+':';
			for(let d=0;d<2;d++) {
			let cubeFace:CubeFace=cubical.initiallocation.cubeEdge.getNeigbouringFaces()[d];
			colors.push(cubeFace.index);
			cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
			if (log) logString+=cubeFace.toString()
				+'('+cubeFace.getNormalVector().toString()
				+'->'+cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString()+')'
				+'('+cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
				+'->'+cubical.location.coordinates.add(cubeFace.getNormalVector()).transformAroundZero(cubical.reorientation.matrix).toString()+') ';
			if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) '+logString);
			}
		}
		if (log) logString=logString+'\n';
		for(let index=0;index<FaceCubicalLocation.getIndexBound(cubeState.spec);index++) {
			let cubical:FaceCubical=cubeState.faceCubicals[index];
			if (log) logString=logString+'FaceCubical'+cubical.initiallocation.coordinates.toString()+':';
			for(let d=0;d<1;d++) { //loop d=0 just for being parallel with EdgeCubical, CornerCubical
			let cubeFace:CubeFace=cubical.initiallocation.cubeFace.getNeigbouringFaces()[d];
			colors.push(cubeFace.index);
			cubeCoordinates.push(cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)));
			if(log)logString+=cubeFace.toString()
				+'('+cubeFace.getNormalVector().toString()
				+'->'+cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix).toString()+')'
				+'('+cubical.initiallocation.coordinates.add(cubeFace.getNormalVector()).toString()
				+'->'+cubical.location.coordinates.add(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix)).toString()+') ';
			if (!CubeFace.isANormalVector(cubeFace.getNormalVector().transformAroundZero(cubical.reorientation.matrix), cubical.location)) throw new Error('Rotated normal vector is not normal vector of new location (invalid reorientations?) '+logString);
			}
		}
		if (log) logString=logString+'\n';
		if (log) console.log(logString);
		return new ColoredCube(cubeState.spec,cubeCoordinates, colors);
	}

	//CAREFUL: 
	//Several equal EdgeCubicals or FaceCubicals are not distinguished in ColoredCube, are just "invented" 
	//The orientations of FaceCubicals are not dishinguished in ColoredCube, are just "invented"
	public toCubeState():CubeState{
		let cornerCubicals:Array<CornerCubical>= new Array<CornerCubical>();
		let edgeCubicals:Array<EdgeCubical>= new Array<EdgeCubical>();
		let faceCubicals:Array<FaceCubical>= new Array<FaceCubical>();
		let initiallocationIndexAlreadyFound:Array<boolean>;//to avoid finding several times the same initialLocation fot location in NxNxX FaceCubicals and EdgesCubicals
		
		//CORNER
		initiallocationIndexAlreadyFound=new Array<boolean>(); //SPECIAL FOR CORNER: disposable, because corners are unique,  just implelemted for parallelity
		for(let initiallocationIndex=0;initiallocationIndex<CornerCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {initiallocationIndexAlreadyFound.push(false);}	
		for(let locationIndex=0;locationIndex<CornerCubicalLocation.getIndexBound(this.spec);locationIndex++) {
			let location:CornerCubicalLocation=new CornerCubicalLocation(this.spec,locationIndex);
			//find colors at this location
			let cubicalColors=new Array<CubeFace>();
			for(let d=0;d<3;d++) {
				let cubeFace:CubeFace=location.cubeCorner.getNeigbouringFaces()[d];
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			let locationNeighbouringFaces=location.getNeighbouringFaces(); //in order to match orientation later
			let initiallocation:CornerCubicalLocation;
			let rotation:number;
			let found=false;
			//TODO Implement this "search for rotation" uniformely for Corner, Edge, Face
			//and even better by computing with matrices ?
			searchC:
			for(let initiallocationIndex=0;initiallocationIndex<CornerCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {
				if(initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation=new CornerCubicalLocation(this.spec,initiallocationIndex); 
				for(rotation=0;rotation<3;rotation++){
					if ((cubicalColors[0].index==initiallocation.cubeCorner.getNeigbouringFaces()[0].index)
					&& (cubicalColors[1].index==initiallocation.cubeCorner.getNeigbouringFaces()[1].index)
					&& (cubicalColors[2].index==initiallocation.cubeCorner.getNeigbouringFaces()[2].index)) {
						found=true;
						initiallocationIndexAlreadyFound[initiallocationIndex]=true;
						break searchC;			
					}	
					//Try different rotation
					cubicalColors=[cubicalColors[1],cubicalColors[2],cubicalColors[0]]; 
					locationNeighbouringFaces=[locationNeighbouringFaces[1],locationNeighbouringFaces[2],locationNeighbouringFaces[0]];
				}
			}
			if (!found) throw 'Not found cubical with color combination '+cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()+cubicalColors[2].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			let reorientationMatrix=Rotation.getTransitivityMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(),initiallocation.getNeighbouringFaces()[1].getNormalVector(),initiallocation.getNeighbouringFaces()[2].getNormalVector(),locationNeighbouringFaces[0].getNormalVector(),locationNeighbouringFaces[1].getNormalVector(),locationNeighbouringFaces[2].getNormalVector());;
			cornerCubicals.push(new CornerCubical(this.spec,initiallocation,location,new Reorientation(reorientationMatrix)));
		}
		//EDGE
		initiallocationIndexAlreadyFound=new Array<boolean>(); 
		for(let initiallocationIndex=0;initiallocationIndex<EdgeCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {initiallocationIndexAlreadyFound.push(false);}
		for(let locationIndex=0;locationIndex<EdgeCubicalLocation.getIndexBound(this.spec);locationIndex++) {
			let location:EdgeCubicalLocation=new EdgeCubicalLocation(this.spec,locationIndex);
			//find colors at this location
			let cubicalColors=new Array<CubeFace>();
			for(let d=0;d<2;d++) {
				let cubeFace:CubeFace=location.cubeEdge.getNeigbouringFaces()[d];
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			let locationNeighbouringFaces=location.getNeighbouringFaces(); //in order to match orientation later
			let initiallocation:EdgeCubicalLocation;
			let rotation:number;
			let found=false;
			searchE:
			for(let initiallocationIndex=0;initiallocationIndex<EdgeCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {
				if(initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation=new EdgeCubicalLocation(this.spec,initiallocationIndex); 
				for(rotation=0;rotation<2;rotation++){
					if ((cubicalColors[0].index==initiallocation.cubeEdge.getNeigbouringFaces()[0].index)
					&&(cubicalColors[1].index==initiallocation.cubeEdge.getNeigbouringFaces()[1].index)) {
						found=true;
						initiallocationIndexAlreadyFound[initiallocationIndex]=true;
						break searchE;			
					}	
					cubicalColors=[cubicalColors[1],cubicalColors[0]]; 
					locationNeighbouringFaces=[locationNeighbouringFaces[1],locationNeighbouringFaces[0]];

				}
			}
			if (!found) throw 'Not found cubical with color combination '+cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			let reorientationMatrix=Rotation.getTransitivityOrthogonalMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(),initiallocation.getNeighbouringFaces()[1].getNormalVector(),locationNeighbouringFaces[0].getNormalVector(),locationNeighbouringFaces[1].getNormalVector());;
			edgeCubicals.push(new EdgeCubical(this.spec,initiallocation,location,new Reorientation(reorientationMatrix)));
		}

		/////FACE
		initiallocationIndexAlreadyFound=new Array<boolean>(); 
		for(let initiallocationIndex=0;initiallocationIndex<FaceCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {initiallocationIndexAlreadyFound.push(false);}	
		for(let locationIndex=0;locationIndex<FaceCubicalLocation.getIndexBound(this.spec);locationIndex++) {
			let location:FaceCubicalLocation=new FaceCubicalLocation(this.spec,locationIndex);
			//find colors at this location
			let cubicalColors=new Array<CubeFace>();
			for(let d=0;d<1;d++) {
				//FACE SPECIAL let cubeFace:CubeFace=location.cubeFace.neigbouringFaces[d];
				let cubeFace:CubeFace=location.cubeFace;
				//console.log('('+location.coordinates.add(normalVector).toString()+':'+this.getColorAt(location.coordinates.add(normalVector)).toString());
				cubicalColors.push(CubeFace.fromIndex(this.getColorAt(location.coordinates.add(cubeFace.getNormalVector()))));
			}
			//search for initial location
			let locationNeighbouringFaces=location.getNeighbouringFaces(); //SPECIAL FOR FACE no rotation necessary, otherwise in order to match orientation later
			let initiallocation:FaceCubicalLocation;
			let rotation:number;
			let found=false;
			searchF:
			for(let initiallocationIndex=0;initiallocationIndex<FaceCubicalLocation.getIndexBound(this.spec);initiallocationIndex++) {
				if(initiallocationIndexAlreadyFound[initiallocationIndex]) continue;
				initiallocation=new FaceCubicalLocation(this.spec,initiallocationIndex); 
				for(rotation=0;rotation<1;rotation++){
					if ((cubicalColors[0].index==initiallocation.cubeFace.getNeigbouringFaces()[0].index)) {
						found=true;
						initiallocationIndexAlreadyFound[initiallocationIndex]=true;
						break searchF;			
					}	
					cubicalColors=[cubicalColors[0]]; 
					locationNeighbouringFaces=[locationNeighbouringFaces[0]];
				}
			}
			if (!found) throw 'Not found cubical with color combination '+cubicalColors.toString();
			//console.log(cubicalColors[0].index.toString()+cubicalColors[1].index.toString()+cubicalColors[2].index.toString()
			//	+'('+initiallocation.coordinates.toString()+'->'+location.coordinates.toString()+"|"+rotation.toString()+') ')
			let reorientationMatrix=Rotation.getTransitivityGuessedOrthogonalMatrix(initiallocation.getNeighbouringFaces()[0].getNormalVector(),locationNeighbouringFaces[0].getNormalVector());;
			faceCubicals.push(new FaceCubical(this.spec,initiallocation,location,new Reorientation(reorientationMatrix)));
		}
		return new CubeState(this.spec,cornerCubicals,edgeCubicals,faceCubicals);
		/////////////////
		////EDGE HAS MULTIPLE HITS in NxNxN Cube!!!
	}

	//TODO Could be improved by directly memorizing a 3dim Array -1...N
	public getColorAt(coordinates:CubeCoordinates):number {
		for(let i:number=0;i<this.cubeCoordinates.length;i++) {
			if(deepEqual(this.cubeCoordinates[i],coordinates)) return this.colors[i];
		}
		throw new Error('Coordinate '+coordinates.toString()+' not found in ColorCobe');
		return null;
	}

	public toString() {
		return CubeStateLanguage.toString(this);
	}
}

export class CubeStateLanguage {
	constructor(readonly spec:CubeSpecification) {}

	private static toStringLiteral(color:number):string {
		return color.toString()+' ';
	}
	private static toStringLiteralEmpty():string {
		return '  ';
	}


	public toString(coloredCube:ColoredCube):string {
		return CubeStateLanguage.toString(coloredCube);
	}

	public static toString(coloredCube:ColoredCube) {
		/*
		//If toString does not work due to errors
 		let rawToString:string=coloredCube.cubeCoordinates.length.toString()+' Entries \n';
		for(let i:number=0;i<coloredCube.cubeCoordinates.length;i++) {
			rawToString=rawToString+'*'+coloredCube.cubeCoordinates[i].toString()+'='+coloredCube.colors[i].toString()+"\n";
		}	
		console.log('Color Cube rawToString'+rawToString);
		*/



		let N:number=coloredCube.spec.edgeLength
		let separator:string=CubeStateLanguage.toStringLiteralEmpty().repeat(N);
		let linebreak:string='\n';
		
		let result:string='';
		let x:number;
		let y:number;
		let z:number;
		let l:number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for(l=0;l<=N-1;l++) {
			result=result+separator;
			//UP
			y=-1;
			z=N-1-l;
			for(x=N-1;x>=0;x--) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			result=result+separator;
			result=result+separator;
			result=result+linebreak;		
		}

		//SECOND BLOCK
		for(l=0;l<=N-1;l++) {
			//LEFT
			x=N;
			y=l;
			for(z=N-1;z>=0;z--) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			//FRONT
			z=-1;
			y=l;
			for(x=N-1;x>=0;x--) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			//RIGHT
			x=-1;
			y=l;
			for(z=0;z<=N-1;z++) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			//BACK
			z=N;
			y=l;
			for(x=0;x<=N-1;x++) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			result=result+linebreak;
		}

		//THIRD BLOCK
		for(l=0;l<=N-1;l++) {
			result=result+separator;
			//DOWN
			y=N;
			z=l;
			for(x=N-1;x>=0;x--) {
				result=result+CubeStateLanguage.toStringLiteral(coloredCube.getColorAt(new CubeCoordinates(x,y,z)));
			}
			result=result+separator;
			result=result+separator;
			result=result+linebreak;		
		}

		return result;
	}

	public static  clearEmptyStringsAndReverse(strings:Array<String>):Array<String> {
		let result:Array<String> = new Array<String>();
		for(let i:number=strings.length-1;i>=0;i--) {
			if (strings[i]!='') result.push(strings[i]);
		}
		return result;
	}

	public static  fromStringLiteral(c:String):number {
		switch(c) {
			case '0': return 0;
			case '1': return 1;
			case '2': return 2;
			case '3': return 3;
			case '4': return 4;
			case '5': return 5;
			default: throw 'Invalid color string literal: '+c;	
		}
		/*switch(c) {
			case 'F': return 0;
			case 'R': return 1;
			case 'U': return 2;
			case 'B': return 3;
			case 'L': return 4;
			case 'D': return 5;
			default: throw 'Invalid color string literal: '+c;	
		}*/	
	}

	public fromString(string:String):ColoredCube {
		return CubeStateLanguage.fromString(this.spec,string);
	}

	public static fromString(spec:CubeSpecification, string:String):ColoredCube {
		let splitString:Array<String> =CubeStateLanguage.clearEmptyStringsAndReverse(string.split(/\s+/)); // oder /\s/
	
		let coordinates:Array<CubeCoordinates>=new Array<CubeCoordinates>();
		let colors:Array<number>=new Array<number>();
		
		//as in toString()
		let N:number=spec.edgeLength;
		let x:number;
		let y:number;
		let z:number;
		let l:number; //line number runnung 1...N-1 per block

		//FIRST BLOCK
		for(l=0;l<=N-1;l++) {
			//UP
			y=-1;
			z=N-1-l;
			for(x=N-1;x>=0;x--) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));
			}		
		}

		//SECOND BLOCK
		for(l=0;l<=N-1;l++) {
			//LEFT
			x=N;
			y=l;
			for(z=N-1;z>=0;z--) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));			}
			//FRONT
			z=-1;
			y=l;
			for(x=N-1;x>=0;x--) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));			}
			//RIGHT
			x=-1;
			y=l;
			for(z=0;z<=N-1;z++) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));			}
			//BACK
			z=N;
			y=l;
			for(x=0;x<=N-1;x++) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));			}
		}

		//THIRD BLOCK
		for(l=0;l<=N-1;l++) {
			//DOWN
			y=N;
			z=l;
			for(x=N-1;x>=0;x--) {
				colors.push(CubeStateLanguage.fromStringLiteral(splitString.pop()));
				coordinates.push(new CubeCoordinates(x,y,z));
			}		
		}

		return new ColoredCube(spec,coordinates,colors);
	}

}


///////////////////////////////////////////////////////////////////////////////


/*export enum CubeFace {
	FRONT = 0,
	RIGHT = 1,
	UP = 2,
	BACK = 3,
	LEFT = 4,
	DOWN = 5
}*/


//TODO NEIGHBOURING FACES
export class CubeFace {
	
	static FRONT=new CubeFace(0,[],CubeDimension.X,CubeDimension.Y,new CubeCoordinates(0,0,0));
	static RIGHT=new CubeFace(1,[],CubeDimension.Y,CubeDimension.Z,new CubeCoordinates(0,0,0));
	static UP=new CubeFace(2,[],CubeDimension.X,CubeDimension.Z,new CubeCoordinates(0,0,0));
	static BACK=new CubeFace(3,[],CubeDimension.X,CubeDimension.Y,new CubeCoordinates(0,0,1));
	static LEFT=new CubeFace(4,[],CubeDimension.Y,CubeDimension.Z,new CubeCoordinates(1,0,0));
	static DOWN=new CubeFace(5,[],CubeDimension.X,CubeDimension.Z,new CubeCoordinates(0,1,0));

	private neigbouringFaces : Array<CubeFace> ;
	public getNeigbouringFaces() : Array<CubeFace> {
		return [this]; 	//neigbouringFaces special to FACE (compared to EDGE, CORNER)
	}

	//public neigbouringFaces : Array<CubeFace>=new Array<CubeFace>();
	private constructor(readonly index: number, neigbouringFaces : Array<CubeFace>, readonly dimension1 : CubeDimension, readonly dimension2 : CubeDimension, readonly coordinates:CubeCoordinates ) {
		if (!Number.isInteger(index) || index < 0 || index > 5) throw 'Invalid index';
		this.neigbouringFaces=neigbouringFaces;
	}

	static fromIndex(index:number) : CubeFace {
		switch(index) {
		case 0: return CubeFace.FRONT;
		case 1: return CubeFace.RIGHT;
		case 2: return CubeFace.UP;
		case 3: return CubeFace.BACK;
		case 4: return CubeFace.LEFT;
		case 5: return CubeFace.DOWN;
		default: throw 'Invalid index';	
		}
	}

	static fromCoordinates(dimension1: CubeDimension, dimension2:CubeDimension, coordinates: CubeCoordinates): CubeFace {
		let index:number;
		if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=0;
		} else if (dimension1 === CubeDimension.Y && dimension2 === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=1;
		} else  if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=2;
		} else if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, 1))) {
			index=3;
		} else if (dimension1 === CubeDimension.Y && dimension2 === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(1, 0, 0))) {
			index=4;
		} else  if (dimension1 === CubeDimension.X && dimension2 === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 1, 0))) {
			index=5;
		} else {
			throw 'Invalid CubeFace coordinates'
		}
		return CubeFace.fromIndex(index);
	}

	public getOrthogonalDimension() : CubeDimension {
		if (this.index==0 || this.index==3) return CubeDimension.Z; 
		if (this.index==1 || this.index==4) return CubeDimension.X;
		if (this.index==2 || this.index==5) return CubeDimension.Y;
	}

	public isBackside():boolean {
		if (this.index<3) {
			return false;
		} else {
			return true;
		}
	}


	public getNormalVector(): CubeCoordinates {
		let normalVector:CubeCoordinates;
		if (this.isBackside()) normalVector=(new CubeCoordinates(0,0,0)).addAt(this.getOrthogonalDimension(), +1);
		else normalVector=(new CubeCoordinates(0,0,0)).addAt(this.getOrthogonalDimension(), -1);
		return normalVector;
	}

	public static isANormalVector(normalVector:CubeCoordinates,location:Location):boolean {
		let neighbouringFaces:Array<CubeFace>=location.getNeighbouringFaces();
			for (let i=0;i<neighbouringFaces.length;i++) {
				if (deepEqual(neighbouringFaces[i].getNormalVector(),normalVector)) return true;
			}
		return false;
	}

	public toString():string{
		switch(this.index) {
			case 0: return 'F';
			case 1: return 'R';
			case 2: return 'U';
			case 3: return 'B';
			case 4: return 'L';
			case 5: return 'D';
			default: throw 'Invalid index';	
			}
	}

}



/*export enum CubeEdge {
	UF=0,
	UR=1,
	BU=2,
	LU=3,
	LF=4,
	FR=5,
	RB=6,
	BL=7,
	FD=8,
	RD=9,
	DB=10,
	DL=11
*/
export class CubeEdge {
	static UF=new CubeEdge(0,[CubeFace.UP,CubeFace.FRONT], CubeDimension.X,new CubeCoordinates(0, 0, 0));
	static UR=new CubeEdge(1,[CubeFace.UP,CubeFace.RIGHT ], CubeDimension.Z,new CubeCoordinates(0, 0, 0));
	static BU=new CubeEdge(2,[CubeFace.BACK,CubeFace.UP], CubeDimension.X,new CubeCoordinates(0, 0,1));
	static LU=new CubeEdge(3,[CubeFace.LEFT,CubeFace.UP], CubeDimension.Z,new CubeCoordinates(1, 0, 0));
	static LF=new CubeEdge(4,[CubeFace.LEFT,CubeFace.FRONT], CubeDimension.Y,new CubeCoordinates(1, 0, 0));
	static FR=new CubeEdge(5,[CubeFace.FRONT,CubeFace.RIGHT], CubeDimension.Y,new CubeCoordinates(0, 0, 0));
	static RB=new CubeEdge(6,[CubeFace.RIGHT,CubeFace.BACK], CubeDimension.Y,new CubeCoordinates(0,0, 1));
	static BL=new CubeEdge(7,[CubeFace.BACK,CubeFace.LEFT], CubeDimension.Y,new CubeCoordinates(1, 0, 1));
	static FD=new CubeEdge(8,[CubeFace.FRONT,CubeFace.DOWN], CubeDimension.X,new CubeCoordinates(0, 1, 0));
	static RD=new CubeEdge(9,[CubeFace.RIGHT,CubeFace.DOWN], CubeDimension.Z,new CubeCoordinates(0, 1, 0));
	static DB=new CubeEdge(10,[CubeFace.DOWN,CubeFace.BACK], CubeDimension.X,new CubeCoordinates(0, 1, 1));
	static DL=new CubeEdge(11,[CubeFace.DOWN,CubeFace.LEFT], CubeDimension.Z,new CubeCoordinates(1, 1, 0));

	private neigbouringFaces : Array<CubeFace> ;
	public getNeigbouringFaces() : Array<CubeFace> {
		return this.neigbouringFaces; 	
	}

	private constructor(readonly index: number, neigbouringFaces : Array<CubeFace>, readonly dimension : CubeDimension, readonly coordinates:CubeCoordinates ) {
		if (!Number.isInteger(index) || index < 0 || index > 11) throw 'Invalid index';
		this.neigbouringFaces=neigbouringFaces;
	}

	static fromIndex(index:number) : CubeEdge {
		switch(index) {
		case 0: return CubeEdge.UF;
		case 1: return CubeEdge.UR;
		case 2: return CubeEdge.BU;
		case 3: return CubeEdge.LU;
		case 4: return CubeEdge.LF;
		case 5: return CubeEdge.FR;
		case 6: return CubeEdge.RB;
		case 7: return CubeEdge.BL;
		case 8: return CubeEdge.FD;
		case 9: return CubeEdge.RD;
		case 10: return CubeEdge.DB;
		case 11: return CubeEdge.DL;
		default: throw 'Invalid index';	
		}
	}

	static fromCoordinates(dimension: CubeDimension, coordinates: CubeCoordinates): CubeEdge {
		let index:number;
		if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=0;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=1;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 0, 1))) {
			index=2;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(1, 0, 0))) {
			index=3;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(1, 0, 0))) {
			index=4;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=5;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(0, 0, 1))) {
			index=6;
		} else if (dimension === CubeDimension.Y && deepEqual(coordinates, new CubeCoordinates(1, 0, 1))) {
			index=7;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 1, 0))) {
			index=8;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(0, 1, 0))) {
			index=9;
		} else if (dimension === CubeDimension.X && deepEqual(coordinates, new CubeCoordinates(0, 1, 1))) {
			index=10;
		} else if (dimension === CubeDimension.Z && deepEqual(coordinates, new CubeCoordinates(1, 1, 0))) {
			index=11;
		} else {
			throw 'Invalid CubeEdge coordinates'
		}
		return CubeEdge.fromIndex(index);
	}
}

/*export enum CubeEdge {
	DRF=0, 
	DBR=1, 
	UFR=2, 
	URB=3,    
	ULF=4, 
	UBL=5, 
	DLB=6, 
	DFL=7 
*/
export class CubeCorner {
	
	static DRF=new CubeCorner(0,[CubeFace.DOWN,CubeFace.RIGHT,CubeFace.FRONT],new CubeCoordinates(0, 1, 0));
	static DBR=new CubeCorner(1,[CubeFace.DOWN,CubeFace.BACK,CubeFace.RIGHT],new CubeCoordinates(0, 1, 1));
	static UFR=new CubeCorner(2,[CubeFace.UP,CubeFace.FRONT,CubeFace.RIGHT],new CubeCoordinates(0, 0, 0));
	static URB=new CubeCorner(3,[CubeFace.UP,CubeFace.RIGHT,CubeFace.BACK],new CubeCoordinates(0, 0, 1));
	static ULF=new CubeCorner(4,[CubeFace.UP,CubeFace.LEFT,CubeFace.FRONT],new CubeCoordinates(1, 0, 0));
	static UBL=new CubeCorner(5,[CubeFace.UP,CubeFace.BACK,CubeFace.LEFT],new CubeCoordinates(1, 0, 1));
	static DLB=new CubeCorner(6,[CubeFace.DOWN,CubeFace.LEFT,CubeFace.BACK],new CubeCoordinates(1, 1, 1));
	static DFL=new CubeCorner(7,[CubeFace.DOWN,CubeFace.FRONT,CubeFace.LEFT],new CubeCoordinates(1, 1, 0));

	
	private neigbouringFaces : Array<CubeFace> ;
	public getNeigbouringFaces() : Array<CubeFace> {
		return this.neigbouringFaces; 	
	}
	private constructor(readonly index: number, neigbouringFaces : Array<CubeFace>, readonly coordinates:CubeCoordinates ) {
		if (!Number.isInteger(index) || index < 0 || index > 7) throw 'Invalid index';
		this.neigbouringFaces=neigbouringFaces;
	}

	static fromIndex(index:number) : CubeCorner {
		switch(index) {
		case 0: return CubeCorner.DRF;
		case 1: return CubeCorner.DBR;
		case 2: return CubeCorner.UFR;
		case 3: return CubeCorner.URB;
		case 4: return CubeCorner.ULF;
		case 5: return CubeCorner.UBL;
		case 6: return CubeCorner.DLB;
		case 7: return CubeCorner.DFL;
		default: throw 'Invalid index';	
		}
	}

	static fromCoordinates(coordinates: CubeCoordinates): CubeCorner {
		let index:number;
		if (deepEqual(coordinates, new CubeCoordinates(0, 1, 0))) {
			index=0;
		} else if (deepEqual(coordinates, new CubeCoordinates(0, 1, 1))) {
			index=1;
		} else if (deepEqual(coordinates, new CubeCoordinates(0, 0, 0))) {
			index=2;
		} else if (deepEqual(coordinates, new CubeCoordinates(0, 0, 1))) {
			index=3;
		} else if (deepEqual(coordinates, new CubeCoordinates(1, 0, 0))) {
			index=4;
		} else if (deepEqual(coordinates, new CubeCoordinates(1, 0, 1))) {
			index=5;
		} else if (deepEqual(coordinates, new CubeCoordinates(1, 1, 1))) {
			index=6;
		} else if (deepEqual(coordinates, new CubeCoordinates(1, 1, 0))) {
			index=7;
		} else {
			throw 'Invalid CubeEdge coordinates'
		}
		return CubeCorner.fromIndex(index);
	}
}


///////////////////////////////////////////////////////////////////////////////////////////
////////////////////////// Lukas 
///////////////////////////////////////////////////////////////////////////////////////

	/*
	getLocationOfCubicle(v: Cubicle): Location
	getCubicleAt(v: Location): Cubical
	getOrientationAt<T>(v: Location<T>): Orientation<T>
	getOrientationOn<T>(v: Cubicle<T>): Orientation<T>
	isSolved: boolean
	isLocationSolved(v: Cubicle): boolean
	isCubicleSolved(v: Location): boolean
	*/



/*
getAllEdges
getAllCorners
getAllFaces
getEdgesByFace
getCornersByFace
getEdgesByDimension
getCornersByDimension
getCubicalByCoordinates
*/


export enum CubeAngle {
	C90 = 1,
	C180 = 2,
	CC90 = -1,
	CC180 = -2
}

export class CubeMove {
	constructor(readonly spec: CubeSpecification,
		readonly face: number,
		readonly slices: number,
		readonly angle: CubeAngle) {
		if (!Number.isInteger(face) || face < 0 || face > 5) throw 'Invalid face index';
		if (!Number.isInteger(slices) || slices < 1 || slices > this.spec.edgeLength) throw 'Invalid slices';
		if (!Number.isInteger(angle)) throw 'Invalid angel';
	}
	getInverse(): CubeMove {
		return new CubeMove(this.spec, this.face, this.slices, -this.angle);
	}
}

export interface CubeStateChanged extends EventData {
	readonly oldState: CubeState
	readonly newState: CubeState
	readonly move?: CubeMove
}

export class Cube {

	/**
	 * @event
	 */
	readonly stateChanged = new Event<CubeStateChanged>();

	private state: CubeState

	constructor(state: CubeState) {
		this.state = state;
	}

	getState() {
		return this.state;
	}

	setState(newState: CubeState, source?: object) {
		let oldState = this.state;
		if (newState.spec !== oldState.spec) throw 'Invalid new spec';
		this.state = newState;
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, source: source });
		return this;
	}

	move(move: CubeMove, source?: object) {
		if (move.angle % 4 === 0) return this;
		let oldState = this.state;
		this.state = this.state.move(move);
		this.stateChanged.trigger({ oldState: oldState, newState: this.state, move: move, source: source });
		return this;
	}

	mw(face: number, slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.move(new CubeMove(this.state.spec, face, slices, angle), source);
	}


	mwFront(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.FRONT.index, slices, angle, source);
	}

	mwRight(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.RIGHT.index, slices, angle, source);
	}

	mwUp(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.UP.index, slices, angle, source);
	}

	mwBack(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.BACK.index, slices, angle, source);
	}

	mwLeft(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.LEFT.index, slices, angle, source);
	}

	mwDown(slices: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(CubeFace.DOWN.index, slices, angle, source);
	}

	m(face: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(face, 1, angle, source);
	}

	mFront(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.FRONT.index, angle, source);
	}

	mRight(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.RIGHT.index, angle, source);
	}

	mUp(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.UP.index, angle, source);
	}

	mBack(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.BACK.index, angle, source);
	}

	mLeft(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.LEFT.index, angle, source);
	}

	mDown(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.m(CubeFace.DOWN.index, angle, source);
	}

	r(face: number, angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.mw(face, this.state.spec.edgeLength, angle, source);
	}

	rZ(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.FRONT.index, angle, source);
	}

	rX(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.RIGHT.index, angle, source);
	}

	rY(angle: number | CubeAngle = CubeAngle.C90, source?: object) {
		return this.r(CubeFace.UP.index, angle, source);
	}

	getMoveLanguage() {
		return new CubeMoveLanguage(this.state.spec);
	}

	ml(movesString: string, source?: object) {
		this.getMoveLanguage().parse(movesString).forEach(function (move) {
			this.move(move, source);
		});
		return this;
	}

}