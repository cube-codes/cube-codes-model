import { Permutation } from "../src/"

test('Basic Test', () => {

	let p1 = new Permutation([1, 2, 0]);
	let p2 = new Permutation([1, 0, 2]);

	let a = ['a', 'b', 'c'];

	expect(p1.applyToArray(a)).toEqual(['b', 'c', 'a']);
	expect(p1.inverse).toEqual([2, 0, 1]);
	
	let pResult = Permutation.multiply(p1, p2);

	expect(pResult.mapping).toEqual([2, 1, 0]);
	
});