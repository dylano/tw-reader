import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";

Vue.use(Vuex);

const baseUrl = "http://localhost:5000/api";

const M_LABEL = "M_LABEL";
const M_FRIENDS = "M_FRIENDS";

export default new Vuex.Store({
  state: {
    friends: [],
    label: "LefT"
  },
  mutations: {
    [M_LABEL](state, payload) {
      state.label = payload;
    },
    [M_FRIENDS](state, payload) {
      state.friends = payload;
    }
  },
  actions: {
    updateLabel({commit}, {newLabel}) {
      commit(M_LABEL, newLabel);
    },
    async fetchFriends({commit}) {
      const url = `${baseUrl}/friends`;
      const newFriends = (await axios.get(url)).data;
      commit(M_FRIENDS, newFriends);
    }
  },
  getters: {}
});
