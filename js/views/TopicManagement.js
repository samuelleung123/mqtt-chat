import {Server} from "../models/Server.js";
import {Topic} from "../models/Topic.js";

export const TopicManagement = {
	name: 'topic-management',
	template: `
        <div>
        <div style="padding: 15px; gap: 15px" class="d-flex flex-column">
            <v-expansion-panels v-if="servers.length">
                <template v-for="(server,i) in servers">
                    <v-expansion-panel :key="server.server_id">
                        <v-expansion-panel-header>
                            <div style="flex: 1">
                                <v-icon left>mdi-server</v-icon>
                                {{ server.name }}
                            </div>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <div v-for="topic in topics[server.server_id]">
                                <v-text-field dense hide-detail v-model="topic.topic"></v-text-field>
                            </div>

                            <div class="text-center">
                                <v-btn icon @click="add_new_topic(server)">
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </div>

                            <div class="text-right">
                                <v-btn color="error">Cancel</v-btn>
                                <v-btn color="primary" @click="save(topics[server.server_id])">Save</v-btn>
                            </div>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </template>
            </v-expansion-panels>
        </div>
        </div>
	`,
	data() {
		return {
			servers: [],
			topics: {},

		};
	},
	async created() {
		this.servers = await Server.query();
		this.topics = await Topic.group_by_server();
		this.$emit('update:title', "Topics");
	},
	methods: {
		add_topic(server_topics, topic) {
			if (!server_topics[topic.server_id]) {
				server_topics[topic.server_id] = [];
			}
			server_topics[topic.server_id].push(topic);

			return server_topics;
		},
		add_new_topic(server) {
			this.topics = {...this.add_topic(this.topics, new Topic({server_id: server.server_id}))}
		},
		save(topics) {
			topics.forEach(t => t.save());
		},
	},
}