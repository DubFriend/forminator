var ajax = function ($form, figFN) {

    var applyDefaultFig = function () {
        var fig = figFN();
        fig.type = fig.type || 'POST';
        fig.dataType = fig.dataType ? fig.dataType.toLowerCase() : 'json';
        return fig;
    };

    var applyDefaultFileAjaxFig = function () {
        var fig = applyDefaultFig();
        fig.data = map(fig.data || {}, identity, function (key) {
            return key.replace(/\[\]$/, '');
        });
        return fig;
    };

    if($form.find('input[type="file"]').length) {
        console.log('$.fn.fileAjax');
        $form.fileAjax(applyDefaultFileAjaxFig, false);
    }
    else {
        console.log('$.ajax');
        // form has no files, use standard ajax.
        $form.submit(function (e) {
            e.preventDefault();

            var fig = applyDefaultFig();
            if(fig.validate()) {
                $.ajax({
                    url: fig.url,
                    type: fig.type,
                    data: fig.data,
                    // data: callIfFunction(fig.getData),
                    dataType: fig.dataType,
                    beforeSend: fig.beforeSend,
                    success: function (response) {
                        if(
                            isObject(response) &&
                            (response.status < 200 || response.status >= 300)
                        ) {
                            callIfFunction(fig.error, response);
                        }
                        else {
                            callIfFunction(fig.success, response);
                        }
                    },
                    error: function (jqXHR) {
                        callIfFunction(
                            fig.error,
                            fig.dataType === 'json' ?
                                jqXHR.responseJSON : jqXHR.responseText
                        );
                    },
                    complete: function (jqXHR) {
                        callIfFunction(
                            fig.complete,
                            fig.dataType === 'json' ?
                                jqXHR.responseJSON : jqXHR.responseText
                        );
                    }
                });
            }
        });
    }
};

// var ajax = function ($form, fig) {
//     fig.type = fig.type || 'POST';
//     fig.dataType = fig.dataType.toLowerCase() || 'json';

//     if($form.find('input[type="file"]').length) {
//         console.log('$.fn.fileAjax');
//         // form contains files. fileAjax enables cross browser ajax file uploads
//         var getData = function () {
//             return map(fig.getData() || {}, identity, function (key) {
//                 return key.replace(/\[\]$/, '');
//             });
//         };
//         $form.fileAjax(fig);
//     }
//     else {
//         console.log('$.ajax');
//         // form has no files, use standard ajax.
//         $form.submit(function (e) {
//             e.preventDefault();
//             if(fig.validate()) {
//                 $.ajax({
//                     url: fig.url,
//                     type: fig.type,
//                     data: callIfFunction(fig.getData),
//                     dataType: fig.dataType,
//                     beforeSend: fig.beforeSend,
//                     success: function (response) {
//                         if(
//                             isObject(response) &&
//                             (response.status < 200 || response.status >= 300)
//                         ) {
//                             callIfFunction(fig.error, response);
//                         }
//                         else {
//                             callIfFunction(fig.success, response);
//                         }
//                     },
//                     error: function (jqXHR) {
//                         callIfFunction(
//                             fig.error,
//                             fig.dataType === 'json' ?
//                                 jqXHR.responseJSON : jqXHR.responseText
//                         );
//                     },
//                     complete: function (jqXHR) {
//                         callIfFunction(
//                             fig.complete,
//                             fig.dataType === 'json' ?
//                                 jqXHR.responseJSON : jqXHR.responseText
//                         );
//                     }
//                 });
//             }
//         });
//     }
// };