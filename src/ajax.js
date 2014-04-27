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
        $form.fileAjax(applyDefaultFileAjaxFig, false);
    }
    else {
        // form has no files, use standard ajax.
        $form.submit(function (e) {
            e.preventDefault();

            var fig = applyDefaultFig();
            if(fig.validate()) {
                $.ajax({
                    url: fig.url,
                    type: fig.type,
                    data: fig.data,
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
