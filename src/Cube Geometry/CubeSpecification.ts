import { Equalizable } from "../Interface/Equalizable";
import { Exportable } from "../Interface/Exportable";
import { Identifiable } from "../Interface/Identifiable";
import { Printable } from "../Interface/Printable";

export class CubeSpecification implements Exportable<number>, Identifiable, Equalizable<CubeSpecification>, Printable {

	constructor(readonly edgeLength: number) {
		if (!Number.isInteger(edgeLength) || edgeLength < 2 || edgeLength > 10) throw new Error(`Invalid edge length: ${edgeLength}`);
	}

	static import(value: number): CubeSpecification {
		return new CubeSpecification(value);
	}

	export(): number {
		return this.edgeLength;
	}

	id(): string {
		return JSON.stringify(this.export());
	}

	equals(other: CubeSpecification): boolean {
		return this.edgeLength === other.edgeLength;
	}

	toString(): string {
		return `${this.edgeLength}`;
	}

}