import '../button/button.js';
import '../solution-progress/solution-progress.js';

const template = document.createElement('template');
template.innerHTML = require('./solution-controls.html');


const turnDuration = {
	play:  [600, 400],  // half-turn, quarter-turn
	step:  [750, 500],
	quick: [150, 100]
};


export default class SolutionControls extends HTMLElement {
	constructor() {
		super();
		
		this.attachShadow({mode: 'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));

		this._el_stepback = this.shadowRoot.querySelector('#button-stepback');
		this._el_play = this.shadowRoot.querySelector('#button-play');
		this._el_pause = this.shadowRoot.querySelector('#button-pause');
		this._el_step = this.shadowRoot.querySelector('#button-step');
		this._el_solutionProgress = this.shadowRoot.querySelector('m-solution-progress');

		this._solution = null;
		this._stepIndex = 0;
		this._isPlaying = false;
		this._stepFn = _ => _;
		this._stopFn = _ => _;

		this._el_stepback.addEventListener('click', _ => { this._step(-1) });
		this._el_play    .addEventListener('click', _ => { this._play(this._solution.length) });
		this._el_pause   .addEventListener('click', _ => { this._pause() });
		this._el_step    .addEventListener('click', _ => { this._step(1) });

		this._el_solutionProgress.addEventListener('set-index', evt => this._play(evt.detail, true));
	}

	connectedCallback() {
		this._setIsPlaying(false);
	}

	async _play(toIdx, quick) {  // quick is boolean
		this._setIsPlaying(true);

		// stop in case there is an active move
		await this._stopFn();

		let turns, direction;
		if(toIdx >= this._stepIndex) {  // forward
			direction = 1;
			turns = this._solution.slice(this._stepIndex, toIdx);
		} else {  // backward
			direction = -1;
			turns = this._solution.slice(toIdx, this._stepIndex).reverse().map(t => t[0] + (4-t[1]));
		}

		for(let turn of turns) {
			let duration = turnDuration[quick ? 'quick' : 'play'][turn[1]%2]
			this._el_solutionProgress.updateProgress(this._stepIndex, direction, duration);
			this._stepIndex += direction;
			let stopped = await this._stepFn(turn, duration);
			if(stopped) break;
		}

		this._setIsPlaying(false);
	}

	async _pause() {
		this._setIsPlaying(false);
		await this._stopFn();
	}

	async _step(direction) {  // direction should be 1 or -1
		this._setIsPlaying(false);
		if(direction == 1 && this._stepIndex >= this._solution.length) return;
		if(direction == -1 && this._stepIndex == 0) return;

		// stop in case there is an active move
		await this._stopFn();

		let turn;
		if(direction == 1) turn = this._solution[this._stepIndex];
		else {
			turn = this._solution[this._stepIndex - 1];
			turn = turn[0] + (4 - turn[1]);  // reverse
		}
		let duration = turnDuration.step[turn[1]%2];

		this._el_solutionProgress.updateProgress(this._stepIndex, direction, duration);
		this._stepIndex += direction;
		await this._stepFn(turn, duration);
	}

	_setIsPlaying(x) {
		this._isPlaying = x;
		if(this._isPlaying) {
			this._el_play.hidden = true;
			this._el_pause.hidden = false;
		} else {
			this._el_play.hidden = false;
			this._el_pause.hidden = true;
		}
	}

	set solution(sol) {
		this._solution = sol;
		this._el_solutionProgress.solution = sol;
		this._stepIndex = 0;
	}

	set stepFunction(stepFn) {
		this._stepFn = stepFn;
	}

	set stopFunction(stopFn) {
		this._stopFn = stopFn;
	}
}

customElements.define('m-solution-controls', SolutionControls);
