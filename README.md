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
interfaces on the same page.  In the following examples, the form is given the
name "foo".

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