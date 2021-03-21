import { Cube, CubeFace, CubeState, CubeMoveAngle, CubeMove, Dimension, CubeMoveStringifier, Random, PermutationCubeState, PermutationCubeStateConverter, EventSource } from "../src";
import { CubeletInspector } from "./CubeletInspector"

export class CubeApi {

	constructor(protected readonly cube: Cube) { }

	get cubelets(): CubeletInspector {
		return new CubeletInspector(this.cube.cubelets);
	}

	// Generic Moves

	async range(face: CubeFace, sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		await this.cube.move(new CubeMove(this.cube.spec, face, sliceStart, sliceEnd, angle), source);
		return this;
	}

	async block(face: CubeFace, sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(face, 1, sliceEnd, angle, source);
	}

	async layer(face: CubeFace, sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(face, sliceStart, sliceStart, angle, source);
	}

	async center(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		if (this.cube.spec.edgeLength % 2 === 0) {
			return this;
		}
		return await this.range(CubeFace.getByDimensionAndDirection(dimension, true), Math.floor((this.cube.spec.edgeLength + 1) / 2), Math.floor((this.cube.spec.edgeLength + 1) / 2), angle * (dimension.equals(Dimension.Z) ? 1 : -1), source);
	}

	async inlay(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		if (this.cube.spec.edgeLength < 3) {
			return this;
		}
		return await this.range(CubeFace.getByDimensionAndDirection(dimension, true), 2, this.cube.spec.edgeLength - 1, angle * (dimension.equals(Dimension.Z) ? 1 : -1), source);
	}

	async rotate(dimension: Dimension, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.getByDimensionAndDirection(dimension, true), 1, this.cube.spec.edgeLength, angle, source);
	}

	// Specific Ranges

	async rightRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.RIGHT, sliceStart, sliceEnd, angle, source);
	}

	async upRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.UP, sliceStart, sliceEnd, angle, source);
	}

	async frontRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.FRONT, sliceStart, sliceEnd, angle, source);
	}

	async leftRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.LEFT, sliceStart, sliceEnd, angle, source);
	}

	async downRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.DOWN, sliceStart, sliceEnd, angle, source);
	}

	async backRange(sliceStart: number = 2, sliceEnd: number = 3, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.range(CubeFace.BACK, sliceStart, sliceEnd, angle, source);
	}

	// Specific Blocks

	async rightBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.RIGHT, sliceEnd, angle, source);
	}

	async upBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.UP, sliceEnd, angle, source);
	}

	async frontBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.FRONT, sliceEnd, angle, source);
	}

	async leftBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.LEFT, sliceEnd, angle, source);
	}

	async downBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.DOWN, sliceEnd, angle, source);
	}

	async backBlock(sliceEnd: number = 2, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.block(CubeFace.BACK, sliceEnd, angle, source);
	}

	// Specific Layers

	async right(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.RIGHT, sliceStart, angle, source);
	}

	async up(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.UP, sliceStart, angle, source);
	}

	async front(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.FRONT, sliceStart, angle, source);
	}

	async left(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.LEFT, sliceStart, angle, source);
	}

	async down(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.DOWN, sliceStart, angle, source);
	}

	async back(sliceStart: number = 1, angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.layer(CubeFace.BACK, sliceStart, angle, source);
	}

	// Specific Centers

	async middle(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.center(Dimension.X, angle, source);
	}

	async equator(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.center(Dimension.Y, angle, source);
	}

	async stand(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.center(Dimension.Z, angle, source);
	}

	// Specific Inlays

	async middleInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.inlay(Dimension.X, angle, source);
	}

	async equatorInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.inlay(Dimension.Y, angle, source);
	}

	async standInlay(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.inlay(Dimension.Z, angle, source);
	}

	// Specific Rotations

	async x(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.rotate(Dimension.X, angle, source);
	}

	async y(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.rotate(Dimension.Y, angle, source);
	}

	async z(angle: number | CubeMoveAngle = CubeMoveAngle.C90, source?: EventSource): Promise<CubeApi> {
		return await this.rotate(Dimension.Z, angle, source);
	}

	// Others

	async move(movesString: string, source?: EventSource): Promise<CubeApi> {

		for (const move of new CubeMoveStringifier(this.cube.spec).parse(movesString)) {
			await this.cube.move(move, source)
		}

		return this;
	
	}

	async setSolved(source?: EventSource): Promise<CubeApi> {

		const state = CubeState.fromSolved(this.cube.spec);

		await this.cube.setState(state, source);
		
		return this;
	
	}

	async shuffleByMove(movesLength: number, source?: EventSource): Promise<CubeApi> {

		const cubeClone = this.cube.clone();
		const cubeCloneApi = new CubeApi(cubeClone);
		await cubeCloneApi.shuffleByMoveRecording(movesLength);
		const state = cubeClone.getState();
		
		await this.cube.setState(state, source);

		return this;

	}

	async shuffleByMoveRecording(movesLength: number, source?: EventSource): Promise<CubeApi> {

		source = source ?? {};
		source.animation = source.animation ?? false;

		for (let moveIndex = 0; moveIndex < movesLength; moveIndex++) {
			const face = CubeFace.getByIndex(Random.randomIntegerToInclusivly(5));
			const sliceStart = Random.randomIntegerFromToInclusivly(1, Math.ceil(this.cube.spec.edgeLength / 2));
			await this.layer(face, sliceStart, CubeMoveAngle.C90, source);
		}

		return this;

	}

	async shuffleByExplosion(source?: EventSource): Promise<CubeApi> {

		const permutationState = PermutationCubeState.fromShuffleByExplosion(this.cube.spec);
		const permutationStateConverter = new PermutationCubeStateConverter(this.cube.spec);
		const state = permutationStateConverter.toCubeState(permutationState);

		await this.cube.setState(state, source);

		return this;

	}

}