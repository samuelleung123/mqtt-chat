import {Server} from "../models/Server.js";
import {async_timeout} from "../utils.js";

export const ServerManagement = {
	name: 'server-management',
	template: `
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
                        <div class="grid-container grid-xs-1-column grid-md-2-column">
                            <v-text-field label="Name" v-model="server.name"></v-text-field>
                            <v-text-field label="Host" v-model="server.host"></v-text-field>
                            <v-text-field label="Username" v-model="server.username"></v-text-field>
                            <v-text-field label="Password" v-model="server.password" type="password"></v-text-field>

                            <div class="grid-col-xs text-right">
                                <v-btn color="error">Cancel</v-btn>
                                <v-btn color="primary" @click="server.save()">Save</v-btn>
                            </div>
                        </div>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </template>
        </v-expansion-panels>
        <div class="text-center">
            <v-btn icon color="success" @click="add_record">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </div>
        </div>
	`,
	data() {
		return {
			servers: [],
		};
	},
	async created() {
		await async_timeout();
		this.refresh_list();
		this.$emit('update:title', "Servers");
	},
	methods: {
		async refresh_list() {
			this.servers = await Server.query();
		},
		add_record() {
			this.servers.push(new Server({name: "New Server"}));
		},
	},
}