import {Model} from "../Model.js";

/**
 * @property {number} topic_id
 * @property {number} server_id
 * @property {String} topic
 */
export class Topic extends Model {
	static table = 'Topic'
	static primary_key = 'topic_id'

	static async group_by_server() {
		let list = await this.query();
		return this.map_by_server(list);
	}

	static map_by_server(list) {

		let map = {};
		list.forEach(topic => {
			if (!map[topic.server_id]) {
				map[topic.server_id] = [];
			}
			map[topic.server_id].push(topic);
		});


		return map;
	}

}