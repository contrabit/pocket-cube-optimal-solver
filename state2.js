'use strict';

class State {
	constructor(p, o, prevState, lastMove) {
		this.p = p || [0,1,2,3,4,5,6,7];  // solved permutation
		this.o = o || [0,0,0,0,0,0,0,0];  // solved orientation
		this.prevState = prevState || null;
		this.lastMove = lastMove || null;
	}
	
	
	/** Generates new State instance
	*/
	move(move) {
		var a, b;
		switch(move) {
			case 'U1': a = [2,0,3,1,4,5,6,7]; b = [0,0,0,0,0,0,0,0]; break;
			case 'U2': a = [3,2,1,0,4,5,6,7]; b = [0,0,0,0,0,0,0,0]; break;
			case 'U3': a = [1,3,0,2,4,5,6,7]; b = [0,0,0,0,0,0,0,0]; break;
			case 'F1': a = [1,5,2,3,0,4,6,7]; b = [1,2,0,0,2,1,0,0]; break;
			case 'F2': a = [5,4,2,3,1,0,6,7]; b = [0,0,0,0,0,0,0,0]; break;
			case 'F3': a = [4,0,2,3,5,1,6,7]; b = [1,2,0,0,2,1,0,0]; break;
			case 'R1': a = [4,1,0,3,6,5,2,7]; b = [2,0,1,0,1,0,2,0]; break;
			case 'R2': a = [6,1,4,3,2,5,0,7]; b = [0,0,0,0,0,0,0,0]; break;
			case 'R3': a = [2,1,6,3,0,5,4,7]; b = [2,0,1,0,1,0,2,0]; break;
			case 'x1': a = [4,5,0,1,6,7,2,3]; b = [2,1,1,2,1,2,2,1]; break;
			case 'x2': a = [6,7,4,5,2,3,0,1]; b = [0,0,0,0,0,0,0,0]; break;
			case 'x3': a = [2,3,6,7,0,1,4,5]; b = [2,1,1,2,1,2,2,1]; break;
			case 'y1': a = [2,0,3,1,6,4,7,5]; b = [0,0,0,0,0,0,0,0]; break;
			case 'y2': a = [3,2,1,0,7,6,5,4]; b = [0,0,0,0,0,0,0,0]; break;
			case 'y3': a = [1,3,0,2,5,7,4,6]; b = [0,0,0,0,0,0,0,0]; break;
			case 'z1': a = [1,5,3,7,0,4,2,6]; b = [1,2,2,1,2,1,1,2]; break;
			case 'z2': a = [5,4,7,6,1,0,3,2]; b = [0,0,0,0,0,0,0,0]; break;
			case 'z3': a = [4,0,6,2,5,1,7,3]; b = [1,2,2,1,2,1,1,2]; break;
		}
		
		var p = [0,0,0,0,0,0,0,0];
		var o = [0,0,0,0,0,0,0,0];
		
		for(var i=0; i<8; ++i) {
			p[i] = this.p[a[i]];
			o[i] = (this.o[a[i]] + b[i]) % 3;
		}
		
		return new State(p, o, this, move);	
	}
	
	moves(moves) {
		if(typeof moves == 'string') {
			moves = moves.split(' ').map(x => {
				if(x.length==1) return x+'1';
				if(x[1]=="'") return x[0]+'3';
				return x;
			});
		}
		let s = this;
		for(let i=0; i<moves.length; i++) s = s.move(moves[i]);
		return s;
	}
	
	toString() {
		return '[' + this.p + '] [' + this.o + ']';
	}

	
	// works only for normalized state
	isSolved() {
		for(var i=0; i<8; i++) if(this.p[i] != i || this.o[i]) return false;
		return true;
	}

	
	/** Rotate cube so cubie 7 is in its right place and orientation.
		Returns newly generated state with move history.
	*/
	normalize() {
		if(this.p[7]==7 && this.o[7]==0) return this;
		let moves = ['x1', 'x2', 'x3', 'y1', 'y2', 'y3', 'z1', 'z2', 'z3'];
		for(let move1 of moves) {
			let s1 = this.move(move1);
			if(s1.p[7]==7 && s1.o[7]==0) return s1;
			for(let move2 of moves) {
				if(move2[0] == move1[0]) continue;
				let s2 = s1.move(move2);
				if(s2.p[7]==7 && s2.o[7]==0) return s2;
			}
		}
	}
	
	key() {
		let b = '';
		for(let j=0; j<7; j++) b += this.p[j];
		for(let j=0; j<6; j++) b += this.o[j];
		return b;
	}

	
}


module.exports = State;
