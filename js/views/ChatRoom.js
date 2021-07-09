import {Topic} from "../models/Topic.js";
import {Server} from "../models/Server.js";
import {Message} from "../models/Message.js";

export const ChatRoom = {
	name: 'chat-room',
	template: `
        <div style="position: absolute; top: 0; left: 0;width: 100%; height: 100%" class="d-flex flex-column">

        <div class="d-flex flex-wrap flex-column" style="gap: 15px; padding: 15px; flex: 1">
            <div>
                <template v-for="item in messages">
                    <div class="d-flex flex-wrap" :class="{'blue lighten-5': item.is_me }">
                        <div class="font-weight-bold"
                             :style="{width: $vuetify.breakpoint.smAndDown ? '100%' : '100px'}">{{ item.sender }}
                        </div>
                        <div style="flex: 1" :style="{paddingLeft: $vuetify.breakpoint.smAndDown ? '30px' : '0' }">
                            <div class="text-pre-wrap">{{ item.content }}</div>
                        </div>

                    </div>
                </template>
            </div>
        </div>

        <div style="padding: 15px;gap: 15px"
             class="grey lighten-5 d-flex align-center">
            <v-textarea
                v-model="message"
                ref="textarea"
                filled
                dense
                hide-details
                rounded
                rows="1"
                no-resize
                @keypress.enter="submitWithEnter"
            ></v-textarea>

            <v-btn icon @click="submit">
                <v-icon>mdi-send</v-icon>
            </v-btn>
        </div>
        </div>
	`,
	data() {
		return {
			message: null,
			messages: [],
			topic: null,
			server: null,
		};
	},
	async created() {
		this.refresh();
		document.body.addEventListener('mqtt:new_message', (e) => {
			let message = e.detail.message;
			if (message.topic_id === this.topic.topic_id && message.server_id === this.server.server_id) {
				this.messages.push(message);
			}
		})
	},
	watch: {
		'$route': function () {
			this.refresh();
		},
		async message(newValue, oldValue) {
			await this.$nextTick();
			if (this.$refs.textarea) {
				let el = this.$refs.textarea.$el.querySelector('textarea');
				el.style.height = '';
				el.style.height = el.scrollHeight + 'px';
			}
		},
	},
	computed: {
		conn() {
			return Server.server_connections.get(this.server.server_id);
		},
	},
	methods: {
		async refresh() {
			this.topic = await Topic.get_by_id(this.$route.params.id);
			this.server = await Server.get_by_id(this.topic.server_id);
			this.messages = await Message.query(m => m.server_id === this.server.server_id && m.topic_id === this.topic.topic_id);
			this.$emit('update:title', this.topic.topic);
		},
		submitWithEnter(e) {
			if (e.shiftKey || e.ctrlKey) {
				return;
			}
			e.preventDefault();
			this.submit();
		},
		submit() {
			if (this.message == null || this.message === '') {
				return;
			}
			this.conn.publish(this.topic.topic, JSON.stringify({
				content: this.message,
				client_id: this.conn.options.clientId,
			}))
			this.message = null;
		},
	},
}