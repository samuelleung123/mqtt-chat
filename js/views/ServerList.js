import {Server} from "../models/Server.js";
import {async_timeout} from "../utils.js";
import {Topic} from "../models/Topic.js";

export const ServerList = {
	name: 'server-list',
	template: `
        <v-list>
        <v-list-item-group v-model="active">
            <template v-for="server in servers">
                <v-list-group
                    :key="server.server_id"
                >
                    <template v-slot:activator>
                        <v-list-item-icon>
                            <v-icon>mdi-server-network</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title v-text="server.name"></v-list-item-title>
                        </v-list-item-content>
                    </template>

                    <template v-for="(topic, index) in topics[server.server_id]">
                        <v-list-item :key="topic.topic_id" link @click="update_current_topic(topic)"
                                     :to="get_url(topic)">
                            <v-list-item-icon>
                                <v-icon>
                                    mdi-subdirectory-arrow-right
                                </v-icon>
                            </v-list-item-icon>

                            <v-list-item-content>
                                <v-list-item-title v-text="topic.topic"></v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-list-group>
            </template>
        </v-list-item-group>
        </v-list>
	`,
	props: {
		current_topic: {
			type: Object,
			default: null,
		},
	},
	data() {
		return {
			active: null,
			servers: [],
			topics: {},
		};
	},
	async mounted() {
		document.body.addEventListener('db:Topic/saved', () => {
			console.log('update server list')
			this.refresh();
		})
		document.body.addEventListener('db:Server/saved', () => {
			console.log('update server list')
			this.refresh();
		})
		this.refresh();
	},
	methods: {
		async refresh() {
			this.servers = await Server.query();
			this.topics = await Topic.group_by_server();
		},
		update_current_topic(topic) {
			this.$emit('update:current_topic', topic);
		},
		get_url(topic) {
			return `/topic/${topic.topic_id}`
		},
	},
}