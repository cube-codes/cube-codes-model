import { CubeSpecification, CubeSolutionCondition, CubeSolutionConditionType, Cube, CubeFace } from '../../src';
import { CubePart } from '../../src/Cube Geometry/CubePart';
import { CubeApi } from '../../src/Cube/CubeApi';

test('Simple Move', () => {

	const spec = new CubeSpecification(3);
	const solv = new CubeSolutionCondition(CubeSolutionConditionType.COLOR);
	const cube = new Cube(spec, solv);
	const CUBE=new CubeApi(cube);
	const CUBELETS=CUBE.cubelets;
	
	CUBE.moveByString('M R L U F F U B B R L U U D L L R R U D B F F F R R L R L F F');
	//.move("....")
	let HANS=CUBELETS.solvedInPart(CubePart.UF).findOne();
	//3er: selbes Enum Location.UF etc
	//3er: .withCurrentPart(CubePart) := inPart().findOne() 
	//3er: .withSolvedPart(CubePart) := solvedInPart(CubePart).findOne()
	let FarbeOben:CubeFace=CUBELETS.inPart(CubePart.U).findOne().getColorAt(CubeFace.UP);
	//3er CUBELETS.currentlyAt(CubePart.U).getColor()   // getColor=getColorAt(cubelet.getNormalVector[0]) if type=Face, error else

	//HANS liegt in der 1. Ebene (obersten Ebene)
	if(HANS.currentLocation.part==CubePart.UF && HANS.getColorAt(CubeFace.UP)==FarbeOben) CUBE.moveByString(" F E F E' ");
	//if (HANS.currentPart()==CubePart.UF
	// HANS.solvedPart()
	if(HANS.currentLocation.part==CubePart.UF && HANS.getColorAt(CubeFace.FRONT)==FarbeOben) CUBE.moveByString(" ");
	/*
	if(HANS r & HANS1 außen) move(R'F');
	if(HANS r & HANS1 oben) move(RRD'FF);
	if(HANS h & HANS1 außen) move(BE'F);
	if(HANS h & HANS1 oben) move(BBDDFF);
	if(HANS l & HANS1 außen) move(LF);
	if(HANS l & HANS1 oben) move(LE'F');
	//HANS liegt in der 2. Ebene (mittlere Ebene)
	if(HANS vr & HANS1 rechts) move(F');
	if(HANS vr & HANS1 vorne) move(EFE');
	if(HANS hr & HANS1 rechts) move(EEFEE);
	if(HANS hr & HANS1 hinten) move(EF'E');
	if(HANS hl & HANS1 links) move(EEF'EE);
	if(HANS hl & HANS1 hinten) move(E'FE);
	if(HANS vl & HANS1 links) move(F);
	if(HANS vl & HANS1 vorne) move(E'F'E);
	//HANS liegt in der 3. Ebene (unterste Ebene)
	if(HANS v & HANS1 außen) move(F'EF);
	if(HANS v & HANS1 unten) move(FF);
	if(HANS r & HANS1 außen) {move(D'); move(F'EF);}
	if(HANS r & HANS1 unten) move(D'FF);
	if(HANS h & HANS1 außen) {move(DD); move(F'EF);}
	if(HANS h & HANS1 unten) move(DDFF);
	if(HANS l & HANS1 außen) {move(D); move(F'EF);}
	if(HANS l & HANS1 unten) move(DFF);
	*/
	});