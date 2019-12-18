<template>
    <section>
        These services are available for Graduate Studies.

        <div v-if="!$byu.user">
            If you have authorization please login to continue.
        </div>
    </section>
</template>

<script>
    export default {
        name: "public"
    }
</script>

<style scoped>

</style>