import {router} from "./router.js";
import {ServerList} from "./views/ServerList.js";
import {Server} from "./models/Server.js";
import {Topic} from "./models/Topic.js";
import {Message} from "./models/Message.js";

const vuetify_config = {
	// breakpoint: {
	// 	thresholds: {
	// 		xs: 576,
	// 		sm: 768,
	// 		md: 992,
	// 		lg: 1200,
	// 	},
	// },
}

window.localforage.config({
	driver: window.localforage.INDEXEDDB,
});

new Vue({
	el: '#app',
	vuetify: new Vuetify(vuetify_config),
	components: {
		ServerList,
	},
	router,
	template: `
        <v-app>
        <v-navigation-drawer
            app
            v-model="drawer"
        >
            <div class="d-flex">
                <v-btn to="/servers" tile plain icon :color="is_route('/servers') ? 'primary': null">
                    <v-icon>mdi-server</v-icon>
                </v-btn>
                <v-btn to="/topics" tile plain icon :color="is_route('/topics') ? 'primary': null">
                    <v-icon>mdi-message-bulleted</v-icon>
                </v-btn>
            </div>

            <v-divider></v-divider>

            <server-list @update:current_topic="change_topic()"></server-list>
        </v-navigation-drawer>

        <v-app-bar app>
            <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

            <template v-if="title">
                <v-toolbar-title>{{ title }}</v-toolbar-title>
            </template>
        </v-app-bar>

        <v-main>
            <router-view @update:title="title = $event"></router-view>
        </v-main>

        </v-app>
	`,
	data() {
		return {
			drawer: this.$vuetify.breakpoint.lgAndUp,
			current_topic: null,
			title: null,
		};
	},
	async created() {
		await Server.init_connections();
	},
	methods: {
		change_topic() {
			if (this.$vuetify.breakpoint.mdAndDown) {
				this.drawer = false;
			}
		},
		is_route(path) {
			return this.$router.currentRoute.path === path;
		},
	},
});