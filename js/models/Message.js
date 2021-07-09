import {Model} from "../Model.js";

/**
 * @property {number} message_id
 * @property {number} server_id
 * @property {number} topic_id
 * @property {String} content
 */
export class Message extends Model {
	static table = 'Message'
	static primary_key = 'message_id'
}