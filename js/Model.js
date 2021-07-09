import {async_timeout} from "./utils.js";

const db_map = new Map();
const db_name = 'mqtt-chat';
let pk_db = get_db('PK', db_name, 'PK');

const pk_map = (await pk_db.getItem('pk_map')) || {};

function get_db(key, db_name, table) {
	if (!db_map.has(key)) {
		let db = window.localforage.createInstance({
			name: db_name,
			storeName: table,
		});
		db_map.set(key, db);
	}

	return db_map.get(key);
}

async function generate_pk(table) {
	if (!pk_map[table]) {
		pk_map[table] = 0;
	}
	pk_map[table] += 1;
	pk_db.setItem('pk_map', pk_map);
	return pk_map[table];
}

class Model {
	static db_name = db_name;
	static table;
	static primary_key;
	static map;
	static save_schedule = 0;
	static query_schedule = [];

	constructor(props = {}) {
		Object.entries(props).forEach(([k, v]) => this[k] = v)
	}

	static get_db() {
		return get_db(this, this.db_name, this.table)
	}

	static async get_map() {
		if (this.map == null) {
			let map = new Map();
			let db = this.get_db();

			let list = await db.getItem('list');
			if (list == null) {
				list = [];
			}
			list.forEach(item => map.set(parseInt(item[this.primary_key]), item));
			this.map = map;
		}

		return this.map;
	}

	async save() {
		if (this[this.constructor.primary_key] == null) {
			this[this.constructor.primary_key] = await generate_pk(this.constructor.table);
		}
		(await this.constructor.get_map()).set(this[this.constructor.primary_key], {...this});
		this.constructor.save_schedule++;
		return this.constructor.real_save();
	}

	static async real_save() {
		await async_timeout();
		this.save_schedule--;
		if (this.save_schedule > 0) {
			return;
		}

		this.save_schedule = 0;
		console.log('saved');
		await this.get_db().setItem('list', await this.query());
		document.body.dispatchEvent(new CustomEvent(`db:${this.table}/saved`))
	}

	delete() {
		return this.constructor.get_db().removeItem(this[this.constructor.primary_key]);
	}

	static async get_by_id(id) {
		let map = await this.get_map()
		let data = map.get(parseInt(id));

		if (data == null) {
			console.error(this.table, id, 'not found')
			return null;
		}

		return new this(data);
	}

	/**
	 * @param {(value: *, index: number, array: *[]) => *} filter_cb
	 * @returns {Promise<Array>}
	 */
	static async query(filter_cb) {
		let key = Math.random();
		this.query_schedule.push(key)
		while (true) {
			await async_timeout();
			if (this.query_schedule[0] === key) {
				return new Promise(async (resolve) => {

					let list = [];
					let map = await this.get_map();

					for (let model of map.values()) {
						list.push(new this(model));
					}
					let pk = this.primary_key;

					list = list.sort((a, b) => parseInt(a[pk]) - parseInt(b[pk]));

					if (filter_cb) {
						list = list.filter(filter_cb);
					}

					this.query_schedule.shift();
					resolve(list);
				});
			}
		}
	}

}

export {
	Model,
}