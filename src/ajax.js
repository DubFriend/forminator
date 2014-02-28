var ajax = function ($form, fig) {
    if($form.find('input[type="file"]').length) {
        // form contains files. fileAjax enables cross browser ajax file uploads
        var getData = function () {
            return map(fig.getData() || {}, identity, function (key) {
                return key.replace(/\[\]$/, '');
            });
        };
        $form.fileAjax(fig);
    }
    else {
        // form has no files, use standard ajax.
        $form.submit(function (e) {
            console.log('asdf', callIfFunction(fig.getData));
            e.preventDefault();
            if(fig.validate()) {
                $.ajax({
                    url: fig.url,
                    method: 'POST',
                    data: callIfFunction(fig.getData),
                    dataType: fig.dataType,
                    beforeSend: fig.beforeSend,
                    success: function (response) {
                        if(
                            isObject(response) &&
                            (response.status < 200 || response.status >= 300)
                        ) {
                            if(fig.error) {
                                fig.error(response);
                            }
                        }
                        else {
                            fig.success(response);
                        }
                    },
                    error: function (jqXHR) {
                        console.log(jqXHR);
                        if(fig.error) {
                            var dataType = fig.dataType ?
                                fig.dataType.toLowerCase() : null;
                            fig.error(
                                jqXHR.responseJSON
                            );
                        }
                    },
                    complete: fig.complete
                });
            }
        });
    }
};