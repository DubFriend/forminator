var createGotoPage = function (fig) {
    var self = createFormBase(fig),
        // errorMessages = union({
        //     noPage: "Must enter a page number.",
        //     notAnInteger: "Must enter valid page number.",
        //     nonPositiveNumber: "Page number must be positive.",
        //     pageNumberOutOfBounds: "Page number cannot exceed " +
        //                            "the total number of pages."
        // }, fig.errorMessages || {}),
        $self = fig.$;

    // self.validate = function (data, maxPageNumber) {
    //     var errors = {};
    //     var pageNumber = toInt(data.page);
    //     if(!data.page) {
    //         errors.page = errorMessages.noPage;
    //     }
    //     else if(isNaN(pageNumber)) {
    //         errors.page = errorMessages.notAnInteger;
    //     }
    //     else if(pageNumber <= 0) {
    //         errors.page = errorMessages.nonPositiveNumber;
    //     }
    //     else if(pageNumber > maxPageNumber) {
    //         errors.page = errorMessages.pageNumberOutOfBounds;
    //     }
    //     return errors;
    // };

    $self.submit(function (e) {
        e.preventDefault();
        self.publish('submit', self.get());
    });

    return self;
};