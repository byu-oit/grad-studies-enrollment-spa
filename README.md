# WABS Starter with Nuxt

This package combines the [byu-wabs](https://www.npmjs.com/package/byu-wabs) package with [nuxt](https://www.npmjs.com/package/nuxt).

- Easy authentication and authorization for BYU web applications
- Out of the box ready for single page apps
- First page load rendered on server, subsequent navigation uses AJAX and JavaScript to update the page.
- [Vuex](https://vuex.vuejs.org/) and routing built in
- [Stylus](http://stylus-lang.com/try.html) enabled
- Always uses the latest official BYU theme

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Run Your Application](#run-your-application)
- [BYU Template](#byu-template)
    - [Navigation Menu](#navigation-menu)
    - [Page Title](#page-title)
    - [Page Search](#page-search)
- [Debugging Your Application](#debugging-your-application)
    - [Browser Debugging](#browser-debugging)
    - [Server Debugging](#server-debugging)

## Quick Start

This section details instructions for getting started with the development of your application.

1. Open a terminal or command line

2. Navigate to the parent directory for your new project.

2. Clone the project from github: `git clone git@github.com:byu-oit/wabs-starter-nuxt.git`.

3. Rename the directory `wabs-starter-nuxt` to your application's name.

4. Navigate into that directory.

5. Log in to AWS

    1. Install AWS Login: https://github.com/byu-oit/awslogin

    2. Run the command `awslogin` to log in

    3. Select the account: `dev-oit-byu`

6. Start the app: `docker-compose up`

    The first time this may take a while.

4. Open a browser to http://localhost:8460

Eventually you will need to set up your own WSO2 application and have your app use that instead of the demo-app. See the documentation at https://www.npmjs.com/package/byu-wabs

## Configuration

The starter is ready out of the box to [run your application](#run-your-application), but eventually you will want to make some configuration changes. At the base of your project directory you may want to change:

1. `package.json` - Update the package name, version, author, dependencies, etc.

2. `confg.js` - Contains configuration specific to this starter, including (but not limited to):

    * Site configuration (title, navigation, search, etc.)

    * [WABS middleware configuration](https://www.npmjs.com/package/byu-wabs#getting-started)

3. `nuxt.config.js` - Contains configuration specific to [Nuxt](https://nuxtjs.org/guide/configuration).

## Run Your Application

To change whether your application is running in production mode or development mode you'll need to:

1. Update your `Dockerfile`

2. Rebuild the Docker image.

Below is an explanation of the differences between development and production.

### Development Mode

Has hot module reloading and dynamic building built in. Web app reloads automatically with each save.

```sh
npm run dev
```

### Production Mode

Runs faster, must be built prior to running.

```sh
npm run build
npm start
```

## BYU Template

Controls are built in to manage the BYU template header text, search, and navigation menu. This is done on a per page basis.

To set default values you can modify the `config.js` file found in the project's base directory under the `site` section of the configuration.

### Navigation Menu

Update the navigation menu items on a page by page basis using the `navigationMenu` function. This function receives an object as its parameter that details where the navigation is going to, where it came from, and what the previous navigation menu looked like. The function should return an array of objects.

If you do not specify a `navigationMenu` function for a page then the default values in the `config.js` will be used.

**Example - Show Navigation Links**

```js
export default {

    // set navigation for this page
    navigationMenu ({ to, from, previous }) {
        return [
            { href: '/', title: 'Home' },
            { href: '/Contact', title: 'Contact' },
            { href: '/Names', title: 'Names' },
            { href: '/Identifiers', title: 'Identifiers' },
            { href: '/Personal', title: 'Personal' },
            { href: 'http://www.google.com', title: 'External' }
        ];
    }

}
```

**Example - Hide Navigation Menu**

```js
export default {

    // set navigation for this page
    navigationMenu ({ to, from, previous }) {
        return null;
    }

}
```

### Page Title

Update the page title on a page by page basis using the `pageTitle` function. This function receives an object as its parameter that details where the navigation is going to, where it came from, and what the previous page title looked like. The function should return a string for the main title or an object that can optionally also specify the title prefix or postfix.

**Example - Main Title Only**

```js
export default {

    // overwrite default page title for this page
    pageTitle ({ to, from, previous }) {
        return 'Main Title'
    }
}
```

**Example - Main Title with Prefix**

```js
export default {

    // overwrite default page title for this page
    pageTitle ({ to, from, previous }) {
        return {
            pre: 'Title Prefix',
            main: 'Main Title'
        }
    }
}
```

**Example - Main Title with Postfix**

```js
export default {

    // overwrite default page title for this page
    pageTitle ({ to, from, previous }) {
        return {
            post: 'Title Prefix',
            main: 'Main Title'
        }
    }
}
```

### Page Search

Update the page search handler on a page basis using the `pageSearch` function. This function receives an object at its parameter that details where the navigation is going to, where it came from, and what the previous page search function was. This function should return a function that will be executed whenever search is run.

Searches can be submitted manually by pressing enter in the search box, or they can be auto run after a specified duration of inactivity (debounce).

**Example - Enable Search with Custom Handler**

```js
export default {

    // overwrite default page title for this page
    pageSearch ({ to, from, previous }) {

        // create a new search handling function
        const newSearchHandler = function (searchTerm, usedAutoSearch) {
            // do something
        };

        // overwrite default debounce duration
        newSearchHandler.debounce = 500;

        return newSearchHandler;
    }
}
```

**Example - Disable Auto Search**

```js
export default {

    // overwrite default page title for this page
    pageSearch ({ to, from, previous }) {

        // create a new search handling function
        const newSearchHandler = function (searchTerm, usedAutoSearch) {
            // do something
        };

        // setting debounce to zero disables auto search for this page
        newSearchHandler.debounce = 0;

        return newSearchHandler;
    }
}
```

**Example - Disable Search**

```js
export default {

    // overwrite default page title for this page
    pageSearch ({ to, from, previous }) {
        return null;
    }
}
```

## Debugging Your Application

### Browser Debugging

Due to the build process the actual code used by the browser is not the same code that you wrote, but using source maps it is possible for you to debug the code still in the browser.

1. Open your browser's developer tools and select the menu to debug the source.

2. Within the sources you should see a section titled `webpack-internal://` and within that a folder that has the same path as your project directory.

3. Within that project director you'll see all of your unchanged files. You can set breakpoints and debug code here.

### Server Debugging

For server side debugging you can debug one of two ways:

1. Using your IDE's built in debugger create a run configuration that runs the node script in `server/index`.

2. You can also run debugging from the command line:

    1. Execute this command from the command line: `node --inspect server/index`

    2. Read the terminal output to see instructions for debugging.

