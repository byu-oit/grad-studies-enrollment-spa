module.exports = function(searchTerm, isAutoSearch) {
    const store = window.$nuxt.$store
    searchTerm = searchTerm.trim()
    if (searchTerm.length > 0) {
        const wabs = store.app.$byu
        return store.dispatch('SIMSearch/getSearchResults', {term: searchTerm})
            .then(response => {
                if (response.status === 200) {
                    const body = response.data
                    if (body.content && body.content.length === 1) {
                        const webResource = body.content[0]
                        wabs.navigateTo(webResource.url)
                    } else if (body.content && !isAutoSearch) {
                        store.commit('SIMSearch/searchResults', body.content)
                        store.commit('SIMSearch/searchTerm', searchTerm)
                        window.$nuxt._router.push('/webResourceSearch')
                    }
                    return body.content
                } else {
                    console.log(response.status, " in WebResource")
                    return null
                }
            })
    }
}