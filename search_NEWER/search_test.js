'use strict';
const CubeState = require('./cubestate');
const search = require('./search');

function generateRandomState() {
	var legalMoves = ['U1', 'U2', 'U3', 'F1', 'F2', 'F3', 'R1', 'R2', 'R3'];
	var moves = [];
	for(var i=0; i<20; i++) {
		moves.push(legalMoves[Math.random()*9|0]);
	}
	var state = CubeState.generateState(moves);
	state.normalize();
	return state;
}


function main() {
	//let startState = CubeState.generateState("U R U' F R F2");
	//let startState = CubeState.generateState("F' U F U R2 U F' U' F U' R2");
	let startState = CubeState.generateState("U R U' R2 U' R' F' U F2 R F'");
	//let startState = CubeState.generateState("U R F2 U R F2 R U F' R");
	//let startState = CubeState.generateState("U3 R2 F1 U1 F1 R3");
	
	startState.normalize();
	
	search(startState);
	console.log('----------------------------------------');
	
	var n = 1;
	console.time('search');
	var solution;
	for(var j=0; j<n; j++) {
		solution = search(startState);
	}
	console.timeEnd('search');
	console.log('steps', solution);
	console.log('----------------------------------------');
}

main();
