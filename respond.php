<?php
if($_REQUEST['text'] === 'w') {
    http_response_code(409);
    echo json_encode(array(
        'text' => 'server doesnt like w',
        'GLOBAL' => 'server error occurred'
    ));
}
else {
    echo json_encode(array(
        'successMessage' => 'Success!',
        'requestData' => $_REQUEST
    ));
}
?>
