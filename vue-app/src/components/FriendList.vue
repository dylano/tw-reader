<template>
  <div>
    <div class="friend-row" v-for="friend in friends" :key="friend.id">
      <div class="avatar">
        <img :src="friend.imgUrl">
      </div>
      <span>{{friend.name}}</span>
      <span>
        <a :href="`https://twitter.com/${friend.screenName}`">Twitter</a>
      </span>
      <span>{{label}}</span>
      <span>{{dupcheck(friend) }}</span>
    </div>
  </div>
</template>


<script>
import { mapState } from "vuex";

export default {
  async created() {
    this.$store.dispatch("fetchFriends");
    this.$store.dispatch({
      type: "updateLabel",
      newLabel: "ima label"
    });
  },
  methods: {
    dupcheck: function(friend) {
      return friend.checkForDuplicates ? "dupcheck" : "";
    }
  },
  computed: {
    ...mapState(["label", "friends"])
  }
};
</script>

<style scoped>
.friend-row {
  display: flex;
  flex-direction: row;
}

.avatar {
  width: 50px;
}
</style>
