<template>
    <div class="container">
        <h1>An error occurred</h1>
        <nuxt-link to="/">About</nuxt-link>
    </div>
</template>

<script>
    export default {
        props: ['message.vue'],
        layout: 'default',
        data() {
            console.log(this.error);
            return {};
        }
    }
</script>