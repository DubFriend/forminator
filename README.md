#The Forminator

##Unleash your awesome form powers.

[View Demo Here](http://briandetering.net/forminator)

Forminator works by using class names and data attributes supplied in the HMTL
markup to declaratively build dynamic, ajax interfaces.

Forminator understands how to build forms, pagination, order, and list widgets
which can be combined to create full CRUD (Create/Read/Update/Delete) interfaces.
These elements can be combined in different ways to create different types of functionality.
A read only interface may be made by ommiting the main form, and edit and delete elements.
A simple ajax form interface may be made by supplying only a form.

The forminator aims to provide as much flexability and ease of use as possible.
Generally speaking you may add extra html elements, attributes, and use different element types.
Things should continue to work as long as you follow the classnames, attribute
patterns and nesting structure as the examples given below.

Full working examples with example server implementations can be found in the code.
See `index.html` or `example_bootstrap.html` for the client implementation, and
`crud.php` for a server-side implemenation.

Tested in ie8, chrome, firefox and safari mobile.

Some forminator html classnames must be appended with a name in order to
distinguish between multiple forminator interfaces on the same page.

In the following examples, the interface is giventhe name `foo`.

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
<form class="frm-search-foo">...</form>
```

###New Item Button
If you want to create things you will need a new item button.
```html
<input class="frm-new-foo" type="button" value="New Item"/>
```

###Pagination Data
Display the number of pages and or results for the given results
```html
Number of pages: <span class="frm-number-of-pages-foo"></span>
Number of results: <span class="frm-number-of-results-foo"></span>
```

###Pagination Numbers
Display the current page number, the adjacent page numbers, and a next and
previous button for page navigation.  Pagination numbers will be hidden if
there is one page or less of results.
```html

<div class="frm-page-numbers-foo">
    <!--
    the "frm-previous" and "frm-next" elements can also be placed
    outside the "frm-page-numbers" container
    -->
    <div class="frm-previous-foo">Previous</div>
    <!--
    forminator will use the first "frm-number-container" as a template
    for rendering subsequent "frm-number-containers"
    you may render multiple "frm-number-container"'s on page load.
    -->
    <div class="frm-number-container">
        <span data-number="1">1</span>
    </div>
    <div class="frm-number-container selected">
        <span data-number="2">2</span>
    </div>
    <div class="frm-number-container">
        <span data-number="3">3</span>
    </div>
    <div class="frm-next-foo">Next</div>
</div>
```

###Pagination Goto Page
Display a "Goto Page" form for page navigation. Pagination Goto Page will be
hidden if their is one page or less of results.
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
page load instead of with a subsequent ajax request is better for SEO, and
gets the data to your users faster.)
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
        <!--
        data-field denotes the field name of a field, "data-value" denotes
        its corresponding value.
        -->
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
var nameForminator = forminator.init({

    // (required)
    // name of the interface, (appended to html class names. see html examples)
    name: 'foo',

    // (required)
    // the url that forminator will make http requests to
    url: 'request.php',

    // (optional, defaults to false)
    // if set to true, forminator will use GET, PUT, POST, and DELETE
    // instead of setting an "action" variable on the url parameters.
    isHardREST: false,

    // (required if updating or deleting items)
    // delete functionality needs to know which field(s) to use to
    // uniquely identify an item.
    uniquelyIdentifyingFields: ['id'],

    // (optional)
    // validate is called whenever the user submits the form.  Validate will be
    // passed the forms data as an object.  According to this doc's html examples,
    // the form might contain data such as...
    // {
    //     name: 'Bob Gunderson',
    //     sex: 'male'
    // }
    // validate should return an errors object, which if empty will denote a passing
    // validation.
    validate: function (data) {
        var errors = {};

        if(data.name.length < 3) {
            // The field named "name" will be given an error message of
            // "3 character minimum." in its corresponding "frm-feedback" container.
            errors.name = '3 character minimum.';
        }

        if(errors.name) {
            // The form's "frm-global-feedback" container will be given an error
            // message of "An error occured."
            errors.GLOBAL = 'An error occured.';
        }

        return errors;
    },

    // (optional)
    // A field validator function is called on individual html input elements
    // (on blur for text based inputs, and on change/click for select, radio,
    // checkbox inputs).
    // Note that field validators are not called on form submit.  In this case
    // use the "validate" function instead.
    fieldValidators: {
        text: function (value) {
            if(!value) {
                return {
                    // error class is added to input group
                    isSuccess: false,
                    // (optional) message inserted into .frm-feedback
                    message: 'Required'
                }
            }
            else {
                return {
                    // success class is added to input group
                    isSuccess: true,
                    // (optional) message inserted into .frm-feedback
                    message: 'OK'
                };
            }
        }
    },

    // (optional)
    // called on a response to a successfull http request.  The "action" parameter
    // will be either "create", "get", "update", or "delete"
    success: function (response, action) {
        console.log('success', response, action, this);
        $('.js-form-modal').modal('hide');
        setTimeout(this.clearFormFeedback, 2000);
    },

    // (optional)
    // called on response to an error http request.
    error: function (response, action) {
        console.log('error', response, action, this);
    },

    // (optional)
    // called on on request complete.
    complete: function (response, action) {
        console.log('complete', response, action, this);
        setTimeout(this.clearFormFeedback, 2000);
    },

    // (optional)
    // called whenever a list item is selected.  "selected" is passed a jquery
    // reference to the selected list item.  The form will be populated with
    // with the selected items data.  In this example the form has been wrapped
    // with a modal which is set to show whenever an item is selected.
    selected: function ($item) {
        $('.js-form-modal').modal('show');
    },

    // (optional, defaults to a confirm dialogue)
    // called whenever the user clicks a "frm-delete-item" element.
    // "deleteConfirmation" is passed a callback which will initiate an http
    // request to delete the selected item when called.  In this example a delete
    // modal is displayed.
    deleteConfirmation: function (deleteItem) {
        var $deleteButton = $('.js-delete');
        var $modal = $('.js-confirm-delete-modal');
        $modal.modal('show');
        $deleteButton.click(function () {
            $modal.modal('hide');
            deleteItem();
            $deleteButton.unbind();
        });
    },

    // (optional)
    // fieldMap's map a data-field's underlying data representation, to a
    // representation visible to the user.
    fieldMap: {
        sex: function (value, allValues) {
            return value.toUpperCase();
        }
    },

    // (optional)
    // choose content to display in ordinator controls for values of "ascending",
    // "descending" and "neutral"
    orderIcons: {
        ascending: 'Goin Up',
        descending: 'Coming Down',
        neutral: 'Round and Round'
    }
});

// clicking the "frm-new" element will reset the form in preperation for creating
// a new element.  In this example the form has been wrapped in a modal and is
// displayed for creating a new element
$('.frm-new-foo').click(function () {
    $('.js-form-modal').modal('show');
});
```


###The Server
Forminator will will construct and send ajax requests at the appropriate times,
and expects results to have a certain format.

Forminator makes four request types, "create", "update", "get" and "delete"

In general, you may add your own data to the request and response, as long as
the required fields are also present.

###get
get requests can be detected server side as they are the only forminator
request type to use the http GET method.  ("create", "update", and "delete" all use POST)

"get" request send "filter", "order" and "page" variables as query
parameters to the url.

####get request

filter and order parameters take the form "filter\_[field name]" and "order\_[field name]".
The filter and order parameters will be taken from the corresponding html's "data-field"
attributes (see html examples above)

an example url might be
`request.php?filter_name=Bob&order_name=ascending&page=2`

Your server side implementation is responsible for delivering appropriate results
sets for these results

####get response
You should respond to GET request with JSON of the following format.
```javascript
{
    // The number of pages returned. Used to update the pagination elements
    "numberOfPages": 5,

    // optional
    // The number of results returned.
    "numberOfResults": 48,

    // the results should be an array of objects whose keys correspond to the
    // "data-field" attributes on the list and form, and order elements.
    // (the "data-field" attributes on the search form do not need to follow the
    // same values)
    "results": [
        {
            "id": 47,
            "name": "Sally Sue",
            "sex": "female"
        },
        {
            "id": 45,
            "name": "John Doe",
            "sex": "male"
        }
        //...
    ]
}
```


###delete

####delete request
"delete" requests send http POST requests and have urls of the following form

`request.php?id=5&action=delete`

In this example a parameter named "id" is passed.  But "delete" will pass whatever
fields have been notified as the set of unique identifiers (see the
"uniquelyIdentifyingFields" field in the Configuration section of the docs).

Your server implementation is responsible for deleting the resource given by the
uniquely identifying fields.

####delete response
```javascript
{}
```


###create

####create request
create requests send a POST request with the following url format.
`request.php?action=create`
the body of the request contains the names and values of the forms "data-field"
attributes.

####create response
The server is expected to create a new resource based on the sent values and
return the uniquely identifying fields (see "uniquelyIdentifyingFields" under
Configuration).

A json response of the following format is expected
```javascript
{
    // required: the uniquely identifying fields (possibly generated on the server)
    // for this item
    "fields": {
        "id": 5
    },

    // optional: a success message that will be rendered into the form's
    // "frm-global-feedback" container
    "successMessage": "A new item has been created!"
}
```

###update

####update request
sends a POST request with a url of the following format

`request.php?action=update`

the body of the request contains the forms data (same as for a create request)

####update response
```javascript
{
    //optional
    "successMessage": "Item has been Updated!"
}
```

##Hard REST
if the `isHardREST` option is set to `true` in the init options, then
forminator will use http's GET, PUT, POST, DELETE methods instead of setting
the `action` url parameter.


###html escaping.

html entities are escaped from values before being inserted into the dom.  Note
that orderIcons are not escaped to allow custom order icons using html.

###File uploads.

forminator supports file inputs and uploads them via ajax, (using an iframe
fallback for older browsers that do not support XHR2).
