class Queue {
	#array
	#TL
	running = false

	constructor(TL) {
		this.#array = [];
		this.#TL = TL;
	}

	push(cb) {
		this.#array.push(cb);
		if (!this.running) this.run();
	}

	async run() {
		this.running = true;
		if (!this.#array.length) {
			this.running = false;
			return;
		}
		await Promise.race([
			(this.#array.shift())(),
			new Promise(r => setTimeout(r, 1000 * this.#TL))
		]);
		this.run();
	}
}

module.exports = Queue;