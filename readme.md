Jtime
=====

Your time tracking companion for Jira.

Installation
------------

1. To install and run this project, you will need to have `gulp` installed. You can install it using  
    `npm install -g gulp-cli`

2. Install dependencies  
    `npm install`

3. copy file `config.sample.js` to `config.js` and edit values
4. 
    - For dev just run  
        `gulp`
    - To run in production mode  
        `gulp build`  
        `npm start`
        
5. Open your browser and go to http://localhost:3000/

Bug & Features
--------------

To see, report and vote for bugs/new features, please check the [bug tracker](https://bitbucket.org/vmeurisse/jtime/issues?status=new&status=open&sort=-priority)

Style Guide
-----------

### Indentation and whitespace

 * Files are indented with 2 spaces.
 * No trailing spaces are allowed
 * Maximum line length is 120 characters. There is an exception for JSDoc comments that can use up to 150

### Js
 
 * Use single quote with the following exceptions
    * String containing single quotes can use double quotes
    * String concatenation is done using string templates

### Css

 * CSS uses single quotes

#### Generals

 * When grouping selectors, keep individual selectors to a single line
 * Lowercase all hex values, e.g., #fff. Lowercase letters are much easier to discern when scanning a document as they tend to have more unique shapes.
 * Use shorthand hex values where available, e.g., #fff instead of #ffffff.
 * Groups of selectors are written with one selector per line. Line return is placed after the comma



#### Property order

Properties are grouped by type. Groups are separated by an empty line.

 1. Special  
    This group contains the properties that impact other and the ones that set content:
    `all`, `content`, `counter-*` , `will-change`
 2. Position & float  
    `clear`, `float`, `position`, `top`, `right`, `bottom`, `left`
 3. Box model
    `display`, `margin`, `border`, `padding`, `height`, `width`, flex…
 4. Typographic
    `text-*`, `font-*`, `color`…
 5. Speech
 6. Others  
    Caution while the `border` shorthand and the associated `border-color`, `border-width`, `border-style` are in the
    box model section, `border-image` and `border-radius` are here.
 
Inside each group, properties are sorted by alphabetical order. Exceptions are:

 * `min-*`, `max-*` are next to the equivalent property, in that order
 * `*top`, `*right`, `*bottom`, `*left` are sorted right after the `*top` property, in that order
 * `*-top-left`, `*-top-right`, `*-bottom-right`, `*-bottom-left` are sorted right after the `*-top-left` property, in that order
 * `*-before` is sorted before `*-after`
 * `border-top*`, `border-right*`, `border-bottom*`, `border-left*` are sorted after other `border*` properties 
