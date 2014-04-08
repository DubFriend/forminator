#The Forminator

##Unleash your awesome form powers.

[View Demo Here](http://briandetering.net/forminator)

Forminator works by using class names and data attributes supplied in the HMTL
markup to declaratively build dynamic, ajax interfaces.

Forminator understands how to build form, pagination, which can be combined to
create full CRUD (Create/Read/Update/Delete) interfaces, down to simple single
form interfaces.

Here is an example using all the elements to create a full crud interface.  You
may omit portions to create for example a read only interface, or only use the form
element to create a simple ajax form.

The forminator aims to provide as much flexability and ease of use with the html
markup as possible.  Generally speaking you may add extra html elements, use
different element types, as long as the classnames and data attributes follow
the same pattern as in the examples below.

Forminator interfaces must be given names to distinguish multiple forminator
interfaces on the same page.  In the following examples, the interface is given
the name "foo".

### The Form
```html
<!--
The main form, denoted by the class "frm-[name]".  Used in the full crud
interface For creating and updating data.
-->
<form class="frm-foo">
    <!--
    "frm-group" elements should contain an html input with a name attribute,
    as well as a corresponding "frm-feedback" container, which will hold error
    and success messages pertaining to the accompanying input.
    -->
    <div class="frm-group">
        <input type="text" name="name">
        <div class="frm-feedback"></div>
    </div>
    <div class="frm-group">
        <input type="checkbox" name="sex" value="male"/>
        <input type="checkbox" name="sex" value="female"/>
        <div class="frm-feedback"></div>
    </div>
    <input type="submit" name="submit" value="Save"/>
    <!--
    "frm-global-feedback" will house error and success messages that pertain
    to the entire form, rather than for specific inputs
    -->
    <div class="frm-global-feedback"></div>
</form>
```

###Search
The search form follows the same format as the regular form.
```html
<form class="frm-search-foo">&hellip;</form>
```

###New Item Button
If you want to create things you might need a new item button.
```html
<input class="frm-new-foo" type="button" value="New Item"/>
```

###Pagination Data
Display the number of pages and results found on the given results
```html
Number of pages: <span class="frm-number-of-pages-foo"></span>
Number of results: <span class="frm-number-of-results-foo"></span>
```

###Pagination Numbers
Display the current page number, the adjacent page numbers, and a next and
previous button for page navigation
```html

<div class="frm-page-numbers-foo">
    <!--
    the "frm-previous" and "frm-next" elements can also be placed
    outside the "frm-page-numbers" container
    -->
    <div class="frm-previous-foo">Previous</div>
    <div class="frm-number-container selected">
        <span data-number="2">2</span>
    </div>
    <div class="frm-next-foo">Next</div>
</div>
```

###Pagination Goto Page
Display a "Goto Page" form for page navigation
```html
<form class="frm-goto-page-foo">
    <div class="frm-group">
        <label>Page</label>
        <!-- the page input should be given the name "page" -->
        <input type="text" name="page"/>
        <div class="frm-feedback"></div>
    </div>
    <input type="submit" value="Goto Page"/>
</form>
```

###Ordinator
Display controls for setting the order of fields in a result set.
Order controls (denoted by the "data-field" attribute) are wrapped in a
"frm-ordinator" container.

The "data-field" attribute tells forminator that the given element is an order
control.  The value of the "data-field" attribute tells forminator what name to
give the field when making requests back to the server.  The "data-order" attribute
gives a value to send back to the server (ascending, descending, or neutral).

Ordinator data-fields that have a data-order of "neutral" will not be sent on
requests to the server.
```html
<div class="frm-ordinator-foo">
    Order by Text
    <!-- data inline -->
    <span data-field="name" data-order="ascending">Ascending</span>
    <!-- or data nested -->
    <span data-field="sex">
        Order by Extra
        <span data-order="neutral">Neutral</span>
    </span>
</div>
```

###Results List
The "frm-list" is where a list of results will be displayed.  Forminator will
use the first "frm-list-item" nested within the "frm-list" as a template for
rendering subsequent results.  You may optionally render multiple results with
"data-value" attributes on initial page load.(Rendering the initial results on
page load instead of with a subsequent ajax request has the SEO advantages, as
well as getting the data out to your users faster.)
```html
<div class="frm-list-foo">
    <div class="frm-list-item">
        <!--
        "frm-edit-item" is optional.
        "frm-edit-item" will use the main "frm" element as an interface
        for editing the selected item.
        Editable items should have a field (or combination of fields) to be used
        as a unique identifier.
        -->
        <span class="frm-edit-item">Edit</span>
        <!--
        "frm-delete-item" is optional.
        Deletable items should have a field (or combination of fields) to be used
        as a unique identifier.
        -->
        <span class="frm-delete-item">Delete</span>
        <!--
        In this example a data-field of "id" is being used as a unique identifier.
        You may specify a field of any name (including a combination of multiple
        fields) to be used as a unique identifier.  (See the Configuration section
        of the Docs.)
        -->
        <span data-field="id" data-value="5" style="display:none;"></span>
        <span>Name</span>
        <span data-field="name" data-value="Bob Gunderson">Bob Gunderson</span>
        <span>Sex</span>
        <span data-field="sex" data-value="male">Male</span>
    </div>
    <!--
    You may have display a list of "frm-list-item" elements on page load,
    however only the first is required by forminator.
    -->
    <div class="frm-list-item">
        <span class="frm-edit-item">Edit</span>
        <span class="frm-delete-item">Delete</span>
        <span data-field="id" data-value="7" style="display:none;"></span>
        <span>Name</span>
        <span data-field="name" data-value="Sally Tallahassee">Sally Tallahassee</span>
        <span>Sex</span>
        <span data-field="sex" data-value="female">Female</span>
    </div>
</div>

<!--
If the server cannot find any matches, the "frm-list" will be hidden,
and this element will be shown instead.
-->
<div class="frm-no-results-name" style="display:none;">No matches found.</div>
```

###Configuration
You will need a bit of javascript to get things configured.
```javascript
```

###The Server
Forminator will will construct and send ajax requests at the appropriate times,
and expects results with a certain format.
