import Vue from "vue";
import Router from "vue-router";
import FriendList from "./components/FriendList.vue";
import TweetPanel from "./components/TweetPanel.vue";
import Settings from "./components/Settings.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
        path: "/",
        name: "tweet-panel",
        component: TweetPanel,
        props: true
      },
      {
      path: "/settings",
      name: "settings",
      component: Settings
    },
    {
      path: "/friends",
      name: "friend-list",
      component: FriendList
    }
  ]
});
