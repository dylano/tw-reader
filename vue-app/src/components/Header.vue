<template>
  <nav>
    <router-link :to="{ name: 'tweet-panel' }">Tweets</router-link>
    {{ ` | ` }}
    <router-link :to="{ name: 'friend-list' }">Friends</router-link>
    {{ ` | ` }}
    <router-link :to="{ name: 'settings' }">Settings</router-link>
  </nav>
</template>

<script>
export default {};
</script>

<style>
</style>
