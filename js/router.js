import {ChatRoom} from "./views/ChatRoom.js";
import {ServerManagement} from "./views/ServerManagement.js";
import {TopicManagement} from "./views/TopicManagement.js";


const router = new VueRouter({
	routes: [
		{path: '/', component: ChatRoom},
		{path: '/servers', component: ServerManagement},
		{path: '/topics', component: TopicManagement},
		{path: '/topic/:id', component: ChatRoom},
	],
});

export {router};