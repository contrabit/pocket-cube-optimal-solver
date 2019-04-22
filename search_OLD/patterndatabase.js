'use strict';
const path = require('path');
const fileTable = require('./filetable');

const tablesDir = path.join(__dirname, 'tables');

const hashes = {
	hash5: function(cubeState) { //avg 7.599925518689986    len 373248 373248
		let p2 = cubeState.p2;
		let p1 = cubeState.p1;
		let p0 = cubeState.p0;
		
		let v = cubeState.o - ((cubeState.o&0b1010101010101010)>>1);
		
		return (p2&0b111 | (p1&0b11100)<<2 | (p0&0b110001)<<3) * 729 +
			(v&0b11) + 
			(v&0b1100)*3/4 + 
			(v&0b110000)*9/16 + 
			(v&0b11000000)*27/64 + 
			(v&0b1100000000)*81/256 + 
			(v&0b110000000000)*243/1024;
	},
	hash6: function(cubeState) { //avg 6.288299560546875    len 32768 32768
		let p2 = cubeState.p2;
		let p1 = cubeState.p1;
		let p0 = cubeState.p0;
		let g = ((cubeState.o&0b010101010101)*0b100001 >> 5) & 0b111111;
		
		return (p2&0b111 | (p1&0b11100)<<2 | (p0&0b110001)<<3)<<6 | g;
	},
	hash7: function(cubeState) { //avg 3.677734375    len 512 512
		let p2 = cubeState.p2;
		let p1 = cubeState.p1;
		let p0 = cubeState.p0;
		let g = ((cubeState.o&0b010101010101)*0b100001 >> 5) & 0b111111;
		
		return (p2&0b111 | (p1&0b11100)<<2 | (p0&0b110001)<<3);
	},
	hash8: function(cubeState) {
		return hashes.hash5(cubeState);
	}
}


function generateTable(id) {
	let cubeStatesFileName = 'cubestates-depth11.gz';
	let cubeStatesFilePath = path.join(tablesDir, cubeStatesFileName);
	if(!fileTable.exists(cubeStatesFilePath)) {
		console.log('Full cube states table ' + '\x1b[1m' + cubeStatesFileName + '\x1b[0m' + ' not found.');
		require('./generatestates')();
	}
	
	process.stdout.write('Loading ' + '\x1b[1m' + cubeStatesFileName + '\x1b[0m' + '...');
	let d0 = Date.now();
	let table = fileTable.fromFile(cubeStatesFilePath, 'Map');
	let keys = table.keys();
	let d1 = Date.now();
	console.log('...done! (' + (d1-d0) + 'ms)');
	
	let fileName = 'pdb-' + id + '.gz'; 
	process.stdout.write('Generating ' + '\x1b[1m' + fileName + '\x1b[0m' + '...');
	d0 = Date.now();
	
	let patternDB;
	if(id=='hash5') {
		patternDB = new Uint8Array(373248).fill(255);
		
		for(let key of keys) {  // key represents state
			let val = table.get(key);
			
			let o = key>>18;
			let p2 = key>>12 & 63;
			let p1 = key>>6 & 63;
			let p0 = key & 63;
			
			// These are not really p2, p1, p0, o, just their lower 6 bits.
			// Higher 2 bits are not important as they are not used for this hash.
			let state = {p2, p1, p0, o};
			
			addTopatternDB(patternDB, hashes[id](state), val);
		}
	}
	if(id=='hash6') {
		patternDB = new Uint8Array(32768).fill(255);
		
		for(let key of keys) {  // key represents state
			let val = table.get(key);
			
			let o = key>>18;
			let p2 = key>>12 & 63;
			let p1 = key>>6 & 63;
			let p0 = key & 63;
			
			// These are not really p2, p1, p0, o, just their lower 6 bits.
			// Higher 2 bits are not important as they are not used for this hash.
			let state = {p2, p1, p0, o};
			
			addTopatternDB(patternDB, hashes[id](state), val);
		}
	}
	if(id=='hash7') {
		patternDB = new Uint8Array(512).fill(255);
		
		for(let key of keys) {  // key represents state
			let val = table.get(key);
			
			let o = key>>18;
			let p2 = key>>12 & 63;
			let p1 = key>>6 & 63;
			let p0 = key & 63;
			
			// These are not really p2, p1, p0, o, just their lower 6 bits.
			// Higher 2 bits are not important as they are not used for this hash.
			let state = {p2, p1, p0, o};
			
			addTopatternDB(patternDB, hashes[id](state), val);
		}
	}
	if(id=='hash8') {
		patternDB = new Uint8Array(373248).fill(255);
		
		for(let key of keys) {  // key represents state
			let val = table.get(key);
			
			// allowed values: 0,6,7,8
			if(val<6) val = 0;
			if(val>8) val = 8;
			
			let o = key>>18;
			let p2 = key>>12 & 63;
			let p1 = key>>6 & 63;
			let p0 = key & 63;
			
			// These are not really p2, p1, p0, o, just their lower 6 bits.
			// Higher 2 bits are not important as they are not used for this hash.
			let state = {p2, p1, p0, o};
			
			addTopatternDB(patternDB, hashes[id](state), val);
		}
	}

	
	d1 = Date.now();
	console.log('...done! (' + (d1-d0) + 'ms)');
	//average(patternDB);
	fileTable.toFile(path.join(tablesDir, fileName), patternDB);
}

function addTopatternDB(patternDB, idx, val) {
	if(val < patternDB[idx]) patternDB[idx] = val;
}


function average(patternDB) {
	let s = 0;
	let k = 0;
	for(let i=0; i<patternDB.length; ++i) {
		let v = patternDB[i];
		if(v<15) {
			s += v;
			k++;
		}
	}
	console.log('avg', s/k, '   len', k, patternDB.length);
	return s/k;
}

module.exports = {
	getTable: function(id) {
		let fileName = 'pdb-' + id + '.gz';
		let filePath = path.join(tablesDir, fileName);
		if(!fileTable.exists(filePath)) {
			console.log('Pattern database ' + '\x1b[1m' + fileName + '\x1b[0m' + ' not found.');
			generateTable(id);
		}
		let patternDB = fileTable.fromFile(filePath, 'Uint8Array');
		let hash = hashes[id];
		return cubeState => patternDB[hash(cubeState)];
	}
};
