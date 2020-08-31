export class Permutation {
	readonly length: number
	readonly inverse: ReadonlyArray<number>
	constructor(readonly mapping: ReadonlyArray<number>) {
		this.length = this.mapping.length;
        let inverse = new Array<number>();
        let me = this
		this.mapping.forEach(function(newIndex, oldIndex) {
			if (!Number.isInteger(newIndex) || newIndex < 0 || newIndex > me.length - 1) throw 'Invalid mapping element';
			if(inverse[newIndex]) throw 'Non-unique mapping element'
			inverse[newIndex] = oldIndex;
        });
        this.inverse = inverse
    }
    static fromTrivial(length: number) {
        if (!Number.isInteger(length) || length < 0) throw 'Invalid length';
        return new Permutation(Array.from({length: length}, (value, key) => key));
    }
	applyToElement(value: number): number {
		if (!Number.isInteger(value) || value < 0 || value > this.mapping.length - 1) throw 'Invalid value';
		return this.mapping[value];
	}
	applyToArray<T>(value: Array<T>): Array<T> {
		if (value.length !== this.length) throw 'Invalid value length';
		let result = new Array<T>();
		for(let index = 0; index < this.length; index++) {
			result[index] = value[this.applyToElement(index)];
		}
		return result;
	}
	getInverse(): Permutation {
		return new Permutation(this.inverse);
	}
	static multiply(permutation1: Permutation, permutation2: Permutation): Permutation {
		if (permutation1.length !== permutation2.length) throw 'Invalid permutation length';
		let resultMapping = new Array<number>();
		for(let index = 0; index < permutation1.length; index++) {
			resultMapping[index] = permutation1.applyToElement(permutation2.applyToElement(index));
        }
		return new Permutation(resultMapping);
	}
}