# Readme

This is the latest framework for static HTML builds.

<hr />

## Getting Started

```
Installation
--------------------------
npm i
```

### Development

For local development use the built in browsersync server. It will open a localhost server (default port 3000). You can have multiple instances of the framework running at the same time and the port number will be incremented.

```
Local Development
--------------------------
npm run start
http://localhost:3000/
```

If required you can define a secific port number, however if this port number is in use then the process will fail.

```javascript
gulp.task('serve', () => {
  return browserSync.init({
    server: {
      baseDir: ['dist'],
    },
    port: 3000,
    notify: false,
    open: true,
  })
})
```

<hr />

### Staging / Production Builds

There is the ability to pass different variables into the HTML dependent on the environment. This is described in the config.js section of the readme.

```
Staging
--------------------------
npm run staging
```

```
Production
--------------------------
npm run production
```

<hr />

## HTML Page Structure

### HTML Page Structure

All pages are created in ./src/pages/, these can either just use the existing index.html or multiple pages. Folders can also be created in the pages directory and will be maintained in the root of the dist directory.

For example:

```
./src/pages/index.html
./src/pages/child-page/index.html
./src/pages/child-page/grandchild-page/index.html
```

Will result in:

```
./dist/index.html
./dist/child-page/index.html
./dist/child-page/grandchild-page/index.html
```

### HTML Templating Framework

Twig has been included as a HTML templating framework. Twig will allow you to use things like if statements and for loops in your html if you require as well as edit things like your header globally. This is completely optional to use, if you wish you can just create a HTML file if you wish.

For help with how to use the JS Twig templating refer to the documentation - https://www.npmjs.com/package/gulp-twig

In the framework there is this setup:

```
Layout
--------------------------
./src/layout/index.html

This is the general page template to wrap page content including <html>, <head>, <body>.
```

```
Pages
--------------------------
./src/pages/*.html

Here are where you defined the pages to be created. By default there is a index.html file. This will be injected into the layout template extended in this section:

{% block content %}{% endblock %}
```

```
Partials
--------------------------
./src/partials/*.html

Here are where you can define portions of code to be included. By default there is a favicons partial.
```

### Passing variables to partials

In order to take full advantage of the partials functionality, you will probably need to pass variables to some of them. This can be done very easily using the following example of a 'post card' piece of HTML.

Firstly, define the data that you would want to pass to the partial in your include:

```
{% include '../partials/example.html' with {
  'title': 'Post Title',
  'description': 'Post Description',
  'link': 'http://example.com',
  'link_text': 'Read more'
} %}
```

Then output these variables in the partial HTML as before:

```html
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ description }}</p>
  <a href="{{ link }}">{{ link_text }}</a>
</div>
```

#### Creating Optional Variables

If you needed to make these variables optional, for example having an optional link. This can be done by using an if statement just as you would in a PHP build.

If I were to remove the link and link_text data being passed to the previous example:

```
{% include '../partials/example.html' with {
  'title': 'Post Title',
  'description': 'Post Description'
} %}
```

The resulting HTML would be:

```html
<div class="card">
  <h3>Post Title</h3>
  <p>Post Description</p>
  <a href=""></a>
</div>
```

However if I were to wrap the \<a\> if an if statement like so:

```html
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ description }}</p>
  {% if link and link_text %}
  <a href="{{ link }}">{{ link_text }}</a>
  {% endif %}
</div>
```

Then we would have our clean outputted HTML code:

```html
<div class="card">
  <h3>Post Title</h3>
  <p>Post Description</p>
</div>
```

### Global Config JSON

For use in the HTML templating language, you can define environment variables to be used by the relevant npm script. These are found in:

```
npm run start
./src/config/config-development.json
```

```
npm run staging
./src/config/config-staging.json
```

```
npm run production
./src/config/config-production.json
```

These environment variables are stored in a JSON object in a key/value format.

By default these settings are included for use in the framework template:

```json
{
  "GA_ID": false,
  "LIVE_URL": false,
  "TWITTER_SITE": false,
  "SOCIAL_IMAGE_URL": false
}
```

For all global environment variables use ALL_CAPS as this will make it easier to identify the difference between environment variables and other template specific twig variables when developing.

Any type of valid JSON is allowed and can be accessed globally.

```
{
  "STRING_VARIABLE": "string",
  "BOOLEAN_VARIABLE": false,
  "OBJECT_VARIABLE": {
    "CHILD_VARIABLE": "string"
  }
}
```

When you want to output one of these values you can use its key like so:

```
{{ STRING_VARIABLE }}

{% if BOOLEAN_VARIABLE == true %}{% endif %}

{{ OBJECT_VARIABLE.CHILD_VARIABLE }}
```

<hr />

## HTML Minification

The outputted HTML will be minified, including any incline CSS and JavaScript. HTML comments will also be removed.

<hr />

## PostCSS

### SASS Compiler

The project will compile SASS contained within the sass directory. A CSS file will be created for each non-partial scss file.

The sass folder structure has purposefully been kept very minimal as static builds tend to be very custom.

```
./src/assets/sass/style.scss
./src/assets/sass/_variables.scss
./src/assets/sass/_mixins.scss
./src/assets/sass/imports/*.scss
```

### Tailwind CSS

Tailwind CSS Framework has also been included but is commented out by default.

Tailwind is a utility class based CSS framework, which allows for rapid builds with maximum reuse. It is ideal for things like landing pages, but less so for bespoke creative builds.

To include tailwind in your project uncomment these lines in the _./src/assets/sass/style.scss_ file.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

The config file for tailwind can be found at _./tailwind-config.js_.

For help with using Tailwind CSS refer to their documentation at https://tailwindcss.com/docs/

### PurgeCSS

In order to keep builds as optimised as possible, PurgeCSS has been included. PurgeCSS will scan the content files passed to it for any instances of the classes included in the compiled CSS files.

If you need to add any other files then you can add these into the array of file paths in content: [].

You will need to add these into the _postcss_ and _purgecss-rejected_ tasks.

```javascript
gulp.task('postcss', function () {
  return gulp
    .src([src_assets_folder + 'sass/**/!(_)*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([require('tailwindcss'), require('postcss-object-fit-images')])
    )
    .pipe(
      autoprefixer({
        grid: true,
      })
    )
    .pipe(
      purgecss({
        content: [
          src_folder + 'layout/**/*.html',
          src_folder + 'pages/**/*.html',
          src_folder + 'partials/**/*.html',
        ],
        keyframes: true,
        variables: true,
        fontFace: true,
        defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      })
    )
    .pipe(minifyCss())
    .pipe(gulp.dest(dist_assets_folder + 'css'))
})
```

If they aren't found then then will be purged from the CSS file to keep as small as possible.

Any classes not found will be added to a \*.rejected.css version of the file for you to refer to if needed.

### Autoprefixer / Minify CSS

Autoprefixer will be ran against the compiled CSS file. This will make writing your CSS as easy as possible and optimise final file size.

<hr />

## Public Directory

Any files or folders added into the _./src/public/_ directory will be copied directly into the _./dist/_ directory. By default there is a font directory for you to add any font files neccessary.

There is a .readme file within the font directory with examples of @font-face declarations for you to use.

<hr />

## Image Optimisation

Images contained within _./src/assets/images/_ will be optimised before being included in the _./dist_ directory.

The image optimisation will run against all _png, jpg, jpeg, gif, svg_ and _ico_ image types.

<hr />

## Prettier Configuration

This framework has prettier included within it directly so there is no need to install globally.

Prettier will allow us to keep consistent coding formatting and optimisations across developers and projects, whilst also making it easier for Git to merge changes.

By having a configuration will for its settings, These settings will be the same across every developer without needing to manually configure each persons editor to do so.

Prettier can be configured through the _./.prettierrc.js_ file within the project.

#### Prettier Git Hook

Prettier is configured to run on a _pre-commit_ hook. It will only run against files that are currently staged.

This means that you won't have to deal with it changing and reformatting your code on every save.

This pre-commit hook has been set up through husky in the package.json files, again making sure that it is stored in the repo and will automatically be used by every developer on the project.

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pretty-quick --staged"
    }
  }
}
```

<hr />

## Editor Config

In order to keep consistent editory settings across the team for easier compatibility, a _.editorconfig_ file has been included in the root of the project.

VS Code will use these settings for things such as tab indenting.

For VS Code to use these settings you will need to install the EditorConfig extension:

https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig

<hr />

## Recommended Extensions

There are a list of recommended extensions for this project. These recommended extensions are managed through the _./.vscode/extensions.json_ file.

You can access and install these extenions through:

```
Extensions Menu > Options Menu > Show Recommended Extensions
```
