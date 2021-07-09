import {Model} from "../Model.js";
import {Topic} from "./Topic.js";
import {Message} from "./Message.js";

/**
 * @property {number} server_id
 * @property {String} name
 * @property {String} host
 * @property {String} username
 * @property {String} password
 */
export class Server extends Model {
	static table = 'Server'
	static primary_key = 'server_id'
	static server_connections = new Map()

	static async init_connections() {
		let servers = await Server.query();
		let server_topics = await Topic.group_by_server();
		servers.forEach(server => {
			let topics = server_topics[server.server_id];
			let client_id = "mqtt_chat_" + Math.random().toString(16).substr(2, 8);
			let conn = this.server_connections.get(server.server_id);
			if (conn == null) {
				conn = window.mqtt.connect(`wss://${server.host}`, {
					clientId: client_id,
					username: server.username,
					password: server.password,
				});
				conn.on('connect', () => {
					this.subscribe_topics(conn, topics);
					console.log(`${server.name} connected`);
				});

				conn.on('message', async function (topic, message) {
					message = JSON.parse(message.toString());
					console.log(message);
					let topic_list = await Topic.query((t) => t.server_id === server.server_id && t.topic === topic);
					if (topic_list.length === 0) {
						console.log(topic, 'not found')
						return;
					}

					let m = new Message({
						server_id: server.server_id,
						topic_id: topic_list[0].topic_id,
						content: message.content,
						client_id: message.client_id,
						is_me: message.client_id === client_id,
						sender: message.client_id.split('mqtt_chat_').join(''),
					})
					m.save();
					document.body.dispatchEvent(new CustomEvent(`mqtt:new_message`, {
						detail: {
							message: m,
						},
					}));
				});
			} else {
				this.subscribe_topics(conn, topics);
			}

			this.server_connections.set(server.server_id, conn);
		})
	}

	static subscribe_topics(conn, topics) {
		if (!topics || topics.length === 0) {
			return;
		}
		conn.subscribe(topics.map(t => t.topic), function (err) {
			if (err) {
				console.error(err);
			}
		});
	}

}